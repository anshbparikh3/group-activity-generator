'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import FriendForm from '@/components/FriendForm'
import Results from '@/components/Results'
import LoadingState from '@/components/LoadingState'
import { Friend, Activity, POI } from './type'

interface OverpassElement {
  tags?: {
    name?: string;
    amenity?: string;
    leisure?: string;
    shop?: string;
  };
  lat?: number;
  lon?: number;
}

interface GroqActivityResponse {
  poiId?: number;
  title: string;
  description: string;
  vibe: string;
}

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
    if (!location || friends.length === 0) {
      setError('Please set a location and add at least one friend.')
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
      const overpassQuery = `
        [out:json];
        (
          node[amenity=cafe](around:8000,${lat},${lon});
          node[amenity=restaurant](around:8000,${lat},${lon});
          node[leisure=park](around:8000,${lat},${lon});
          node[amenity=museum](around:8000,${lat},${lon});
          node[amenity=bar](around:8000,${lat},${lon});
          node[shop=books](around:8000,${lat},${lon});
          node[amenity=cinema](around:8000,${lat},${lon});
          node[amenity=gym](around:8000,${lat},${lon});
          node[leisure=bowling_alley](around:8000,${lat},${lon});
          node[leisure=sports_centre](around:8000,${lat},${lon});
        );
        out body;
      `
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
      })
      const data = await response.json()
      const pois: POI[] = data.elements
        .filter((element: OverpassElement) => element.tags && element.tags.name && element.lat && element.lon)
        .map((element: OverpassElement) => ({
          name: element.tags!.name!,
          type: element.tags!.amenity || element.tags!.leisure || element.tags!.shop || 'venue',
          lat: element.lat!,
          lon: element.lon!
        }))
        .filter((poi: POI, index: number, self: POI[]) => index === self.findIndex((t) => t.name === poi.name))
        .slice(0, 30)
      return pois
    } catch (err) {
      console.error('Failed to fetch POIs:', err)
      return []
    }
  }

  const callGroqAPI = async (pois: POI[], friends: Friend[], city: string): Promise<Activity[]> => {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY

    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      return [
        {
          title: 'Local Café: Coffee Tasting',
          description: 'Explore artisanal coffee and pastries while chatting with friends',
          vibe: 'Chill',
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city)}`
        }
      ]
    }

    const friendsText = friends.map((f) => `${f.name}:\n  Likes: ${f.likes}\n  Dislikes: ${f.dislikes || 'None'}`).join('\n\n')
    const poisText = pois.map((poi, index) => `[ID: ${index}] ${poi.name} (${poi.type})`).join('\n')

    const prompt = `You are a local expert and social coordinator in ${city}. Here are 2-5 friends and their interests:

${friendsText}

Here are specific nearby venues in the area:
${poisText}

Your goal is to return ONLY a valid JSON object with exactly 4 recommendations: 3 based on group consensus and 1 'Wildcard' recommendation that is unexpected but fun.

CRITICAL INSTRUCTION: You MUST select specific venues from the 'nearby venues' list provided above. Use the exact ID of the venue you selected. Do not make up venues.

The JSON format must be exactly:
{
  "activities": [
    {
      "poiId": <Number from the ID field of the selected venue>,
      "title": "Short Activity Name",
      "description": "Explain what you will do at this specific venue and why it satisfies the group's interests.",
      "vibe": "Vibe tag (e.g., Chill, High Energy, Social, Adventurous)"
    }
  ]
}

The last activity should have "vibe": "Wildcard". Return ONLY the JSON object, nothing else.`

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1024,
          response_format: { type: 'json_object' }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
        throw new Error(errorData?.error?.message || `HTTP Error ${response.status}`);
      }

      const data = await response.json()
      const content = data.choices[0].message.content
      const parsedResponse = JSON.parse(content) as { activities: GroqActivityResponse[] }

      return parsedResponse.activities.map((activity, index) => {
        const poi = typeof activity.poiId === 'number' ? pois[activity.poiId] : null;
        
        const mapsUrl = poi 
  ? `https://www.google.com/maps/search/?api=1&query=${poi.lat},${poi.lon}`
  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((activity.title || 'Activity') + ' near ' + city)}`;

        return {
          title: poi ? `${poi.name}: ${activity.title}` : activity.title,
          description: activity.description,
          vibe: activity.vibe,
          isWildcard: index === parsedResponse.activities.length - 1,
          mapsUrl: mapsUrl
        }
      })
    } catch (err) {
      throw new Error(`${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <main className="min-h-screen py-10 px-4 text-slate-200 selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto">
        <Header location={location} onUpdateLocation={handleZipCodeSubmit} />

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl font-medium shadow-inner">
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
              className="w-full mt-6 py-4 px-6 bg-blue-600 text-white rounded-xl font-extrabold text-lg tracking-wide hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all"
            >
              Generate Activities
            </button>
          </>
        )}
      </div>
    </main>
  )
}