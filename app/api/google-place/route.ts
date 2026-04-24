import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!name || !lat || !lon) {
    return NextResponse.json({ error: 'Missing required parameters: name, lat, lon' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key is not configured' }, { status: 500 })
  }

  const placeSearchUrl = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json')
  placeSearchUrl.searchParams.set('input', name)
  placeSearchUrl.searchParams.set('inputtype', 'textquery')
  placeSearchUrl.searchParams.set('fields', 'place_id')
  placeSearchUrl.searchParams.set('locationbias', `point:${lat},${lon}`)
  placeSearchUrl.searchParams.set('key', apiKey)

  try {
    const response = await fetch(placeSearchUrl.toString())
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data?.error_message || 'Google Places lookup failed' }, { status: response.status })
    }

    const placeId = data.candidates?.[0]?.place_id
    if (!placeId) {
      return NextResponse.json({
        url: `https://www.google.com/maps/place/${lat},${lon}/@${lat},${lon},17z`,
      })
    }

    return NextResponse.json({
      place_id: placeId,
      url: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Google Places data' }, { status: 500 })
  }
}
