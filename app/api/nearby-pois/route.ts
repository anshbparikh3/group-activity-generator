import { NextResponse } from 'next/server'
import { POI } from '../../type'

interface OverpassElement {
  tags?: {
    name?: string
    amenity?: string
    leisure?: string
    shop?: string
  }
  lat?: number
  lon?: number
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing required parameters: lat, lon' }, { status: 400 })
  }

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

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json',
        'User-Agent': 'Commvault/1.0 (https://example.com)',
      },
      body: overpassQuery,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error text available')
      return NextResponse.json({ error: `Overpass API error: ${response.status} ${response.statusText}`, details: errorText }, { status: 502 })
    }

    const data = await response.json()
    if (!data || !Array.isArray(data.elements)) {
      return NextResponse.json({ error: 'Unexpected Overpass response format' }, { status: 502 })
    }

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

    return NextResponse.json(pois)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch nearby venues', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 502 })
  }
}
