'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import FriendForm from '@/components/FriendForm'
import Results from '@/components/Results'
import LoadingState from '@/components/LoadingState'

export interface Friend {
  id: string
  name: string
  interests: string
}

export interface Activity {
  title: string
  description: string
  vibe: string
  isWildcard?: boolean
}

export default function Home() {
  const [location, setLocation] = useState<{ city: string; lat: number; lon: number } | null>(null)
  const [friends, setFriends] = useState<Friend[]>([])
  const [activities, setActivities] = useState<Activity[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize location on mount
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

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      )
      const data = await response.json()
      const city = data.address.city || data.address.town || data.address.county || 'Unknown Location'
      setLocation({ city, lat, lon })
    } catch (err) {
      console.error('Reverse geocoding failed:', err)
    }
  }

  const handleZipCodeSubmit = async (zipCode: string) => {
    try {
      // Use a free geocoding service to convert zip code to coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&postalcode=${zipCode}&countrycodes=us`
      )
      const data = await response.json()
      if (data.length > 0) {
        const { lat, lon, address } = data[0]
        const city = address.city || address.town || address.county || zipCode
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

  const addFriend = (friend: Friend) => {
    setFriends([...friends, friend])
  }

  const updateFriend = (id: string, updated: Friend) => {
    setFriends(friends.map((f) => (f.id === id ? updated : f)))
  }

  const removeFriend = (id: string) => {
    setFriends(friends.filter((f) => f.id !== id))
  }

  const generateActivities = async () => {
    if (!location || friends.length === 0) {
      setError('Please set a location and add at least one friend.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Fetch nearby POIs using Overpass API
      const pois = await fetchNearbyPOIs(location.lat, location.lon)

      // Send to Groq API for processing
      const groqResponse = await callGroqAPI(pois, friends, location.city)

      setActivities(groqResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate activities')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchNearbyPOIs = async (lat: number, lon: number): Promise<string[]> => {
    try {
      // Using Overpass API to fetch nearby POIs (restaurants, cafes, parks, museums, etc.)
      const overpassQuery = `
        [out:json];
        (
          node[amenity=cafe](around:2000,${lat},${lon});
          node[amenity=restaurant](around:2000,${lat},${lon});
          node[leisure=park](around:2000,${lat},${lon});
          node[amenity=museum](around:2000,${lat},${lon});
          node[amenity=bar](around:2000,${lat},${lon});
          node[shop=books](around:2000,${lat},${lon});
          node[amenity=cinema](around:2000,${lat},${lon});
          node[amenity=gym](around:2000,${lat},${lon});
          node[tourism=museum](around:2000,${lat},${lon});
        );
        out body;
      `

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
      })

      const data = await response.json()
      const pois = data.elements
        .filter((element: any) => element.tags && element.tags.name)
        .map((element: any) => {
          const type = element.tags.amenity || element.tags.leisure || element.tags.shop || element.tags.tourism || 'venue'
          return `${element.tags.name} (${type})`
        })
        .slice(0, 30) // Limit to top 30 POIs

      return pois
    } catch (err) {
      console.error('Failed to fetch POIs:', err)
      return [] // Return empty if Overpass fails
    }
  }

  const callGroqAPI = async (pois: string[], friends: Friend[], city: string): Promise<Activity[]> => {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY

    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      // Placeholder response if API key not set
      console.warn('Groq API key not configured. Using placeholder response.')
      return [
        {
          title: 'Coffee Tasting at Local Café',
          description: 'Explore artisanal coffee and pastries while chatting with friends',
          vibe: 'Chill',
        },
        {
          title: 'Park Picnic & Games',
          description: 'Pack some snacks and enjoy lawn games in a beautiful park setting',
          vibe: 'Relaxed & Social',
        },
        {
          title: 'Food Truck Tour',
          description: 'Visit multiple food trucks and sample different cuisines together',
          vibe: 'High Energy',
        },
        {
          title: 'Sunset Rooftop Bar Hopping',
          description: 'Hit up local rooftop bars for drinks and views (Wildcard pick!)',
          vibe: 'Fun & Unexpected',
          isWildcard: true,
        },
      ]
    }

    const friendsText = friends
      .map(
        (f) =>
          `${f.name}: ${f.interests}`
      )
      .join('\n')

    const poisText = pois.join(', ')

    const prompt = `You are a local expert and social coordinator in ${city}. Here are 2-5 friends and their interests:

${friendsText}

Here are nearby venues in the area:
${poisText}

Your goal is to return ONLY a valid JSON object (no markdown, no extra text) with exactly 4 recommendations: 3 based on group consensus and 1 'Wildcard' recommendation that is unexpected but fun. The JSON format must be:
{
  "activities": [
    {
      "title": "Activity Title",
      "description": "Why this works for the group",
      "vibe": "Vibe tag (e.g., Chill, High Energy, Social, Adventurous)"
    },
    ...
  ]
}

The last activity should have "vibe": "Wildcard" to indicate it's the unexpected one.

Return ONLY the JSON object, nothing else.`

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768', // or another available model
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0].message.content

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI')
      }

      const parsedResponse = JSON.parse(jsonMatch[0])
      return parsedResponse.activities.map((activity: any, index: number) => ({
        ...activity,
        isWildcard: index === parsedResponse.activities.length - 1,
      }))
    } catch (err) {
      throw new Error(`Failed to generate activities: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Header location={location} onUpdateLocation={handleZipCodeSubmit} />

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
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
              disabled={!location || friends.length === 0}
              className="w-full mt-8 py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Generate Activities
            </button>
          </>
        )}
      </div>
    </main>
  )
}
