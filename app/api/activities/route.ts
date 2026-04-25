import { NextResponse } from 'next/server'
import { Friend, Activity, POI } from '../../type'

interface GroqActivityResponse {
  poiId?: number
  title: string
  description: string
}

const getGoogleMapsPlaceUrl = async (name: string, lat: number, lon: number): Promise<string> => {
  try {
    const placeSearchUrl = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json')
    placeSearchUrl.searchParams.set('input', name)
    placeSearchUrl.searchParams.set('inputtype', 'textquery')
    placeSearchUrl.searchParams.set('fields', 'place_id')
    placeSearchUrl.searchParams.set('locationbias', `point:${lat},${lon}`)
    placeSearchUrl.searchParams.set('key', process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '')

    const response = await fetch(placeSearchUrl.toString())
    const data = await response.json()

    const placeId = data.candidates?.[0]?.place_id
    if (placeId) {
      return `https://www.google.com/maps/place/?q=place_id:${placeId}`
    }
  } catch (err) {
    console.warn('Google Place lookup failed:', err)
  }

  return `https://www.google.com/maps/place/${lat},${lon}/@${lat},${lon},17z`
}

const callGroqAPI = async (pois: POI[], friends: Friend[], city: string): Promise<Activity[]> => {
  const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return [
      {
        title: 'Local Café: Coffee Tasting',
        description: 'Explore artisanal coffee and pastries while chatting with friends',
        vibe: '',
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Local Cafe ' + city)}`
      }
    ]
  }

  const friendsText = friends.map((f) => `${f.name}:\n  Likes: ${f.likes}\n  Dislikes: ${f.dislikes || 'None'}`).join('\n\n')
  const poisText = pois.map((poi, index) => `[ID: ${index}] ${poi.name} (${poi.type})`).join('\n')

  const prompt = `You are a local expert and social coordinator in ${city}. Here are 2-5 friends and their interests:\n\n${friendsText}\n\nHere are specific nearby venues in the area:\n${poisText}\n\nYour goal is to return ONLY a valid JSON object with exactly 4 recommendations: 3 based on group consensus and 1 'Wildcard' recommendation that is unexpected but fun.\n\nCRITICAL INSTRUCTION: You MUST select specific venues from the 'nearby venues' list provided above. Use the exact ID of the venue you selected. Do not make up venues.\n\nThe JSON format must be exactly:\n{\n  "activities": [\n    {\n      "poiId": <Number from the ID field of the selected venue>,\n      "title": "Short Activity Name",\n      "description": "Explain what you will do at this specific venue and why it satisfies the group's interests."\n    }\n  ]\n}\n\nReturn ONLY the JSON object, nothing else.`

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
    const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(errorData?.error?.message || `HTTP Error ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('Invalid response from activity generation API.')
  }

  const parsedResponse = JSON.parse(content) as { activities: GroqActivityResponse[] }

  return await Promise.all(
    parsedResponse.activities.map(async (activity, index) => {
      const poi = typeof activity.poiId === 'number' ? pois[activity.poiId] : null
      const mapsUrl = poi
        ? await getGoogleMapsPlaceUrl(poi.name, poi.lat, poi.lon)
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((activity.title || 'Activity') + ' near ' + city)}`

      return {
        title: poi ? `${poi.name}: ${activity.title}` : activity.title,
        description: activity.description,
        vibe: '',
        isWildcard: index === parsedResponse.activities.length - 1,
        mapsUrl,
      }
    })
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { pois, friends, city } = body

    if (!city || !Array.isArray(friends)) {
      return NextResponse.json({ error: 'Missing required fields: pois, friends, city' }, { status: 400 })
    }

    const activities = await callGroqAPI(pois || [], friends, city)
    return NextResponse.json(activities)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown server error' },
      { status: 500 }
    )
  }
}
