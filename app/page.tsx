'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import FriendForm from '@/components/FriendForm'
import Results from '@/components/Results'
import LoadingState from '@/components/LoadingState'
import { Friend, Activity, POI } from './type'

// Removed vibe from the expected response
export default function Home() {
  const [location, setLocation] = useState<{ city: string; lat: number; lon: number } | null>(null)
  const [friends, setFriends] = useState<Friend[]>([])
  const [activities, setActivities] = useState<Activity[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getLocationFromBrowser = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            await reverseGeocode(latitude, longitude)
          },
          (_error) => {
            console.log('Geolocation denied, user will enter zip code')
          }
        )
      }
    }

    getLocationFromBrowser()
  }, [])

  const fetchWithRetry = async (input: RequestInfo, init?: RequestInit, retries = 2): Promise<Response> => {
    let attempt = 0
    while (true) {
      try {
        const response = await fetch(input, init)
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        return response
      } catch (error) {
        if (attempt >= retries) {
          throw error
        }
        attempt += 1
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
      }
    }
  }

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      )
      const data = await response.json()
      const address = data.address || {}
      const cityBase = address.city || address.town || address.village || address.county || 'Unknown Location'
      const stateCode = address['ISO3166-2-lvl4']?.split('-')[1] || address.state || ''
      const city = stateCode ? `${cityBase}, ${stateCode}` : cityBase
      setLocation({ city, lat, lon })
    } catch (err) {
      console.error('Reverse geocoding failed:', err)
    }
  }

  const handleZipCodeSubmit = async (zipCode: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&postalcode=${zipCode}&countrycodes=us&addressdetails=1`
      )
      const data = await response.json()
      if (data.length > 0) {
        const { lat, lon, address, name } = data[0]
        const cityBase = address?.city || address?.town || address?.village || address?.county || name || zipCode
        const stateCode = address?.['ISO3166-2-lvl4']?.split('-')[1] || address?.state || ''
        const city = stateCode ? `${cityBase}, ${stateCode}` : cityBase
        setLocation({ city, lat: parseFloat(lat), lon: parseFloat(lon) })
        setError(null)
      } else {
        setError('Zip code not found. Please try another.')
      }
    } catch (err) {
      setError('Failed to find location. Please try again.')
      console.error(err)
    }
  }

  const addFriend = (friend: Friend) => setFriends([...friends, friend])
  const updateFriend = (id: string, updated: Friend) => setFriends(friends.map((f) => (f.id === id ? updated : f)))
  const removeFriend = (id: string) => setFriends(friends.filter((f) => f.id !== id))

  const generateActivities = async () => {
    if (!location || friends.length < 2) {
      setError('Please set a location and add at least two friends.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const pois = await fetchNearbyPOIs(location.lat, location.lon)
      const groqResponse = await callGroqAPI(pois, friends, location.city)
      setActivities(groqResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate activities')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchNearbyPOIs = async (lat: number, lon: number): Promise<POI[]> => {
    try {
      const response = await fetchWithRetry(`/api/nearby-pois?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`)
      const data = await response.json()

      if (!response.ok) {
        const message = data?.error || 'Failed to fetch nearby venues.'
        throw new Error(message)
      }

      if (!Array.isArray(data)) {
        throw new Error('Invalid nearby venues response.')
      }

      return data as POI[]
    } catch (err) {
      console.error('Failed to fetch POIs:', err)
      throw new Error('Failed to fetch nearby venues. Please try again.')
    }
  }

  const callGroqAPI = async (pois: POI[], friends: Friend[], city: string): Promise<Activity[]> => {
    const response = await fetchWithRetry('/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pois, friends, city }),
    })

    const result = await response.json().catch(() => null)
    if (!response.ok) {
      const message = result?.error || `Activity generation failed (${response.status})`
      throw new Error(message)
    }

    if (!result || !Array.isArray(result)) {
      throw new Error('Unexpected activity response from server.')
    }

    return result as Activity[]
  }

  return (
    <main className="min-h-screen py-16 px-4 selection:bg-beige selection:text-emerald-950">
      <div className="max-w-4xl mx-auto">
        <Header location={location} onUpdateLocation={handleZipCodeSubmit} hideChangeLocation={!!activities} />

        {error && (
          <div className="mb-8 p-6 bg-white border border-red-900 text-red-900 font-source-sans font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingState />
        ) : activities ? (
          <Results activities={activities} />
        ) : (
          <>
            <FriendForm
              friends={friends}
              onAddFriend={addFriend}
              onUpdateFriend={updateFriend}
              onRemoveFriend={removeFriend}
            />
            <button
              onClick={generateActivities}
              disabled={!location || friends.length < 2}
              className="w-full mt-8 py-5 px-6 bg-beige text-emerald-950 font-poppins font-bold text-lg tracking-widest uppercase hover:bg-beige-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Activities
            </button>
          </>
        )}
      </div>
    </main>
  )
}