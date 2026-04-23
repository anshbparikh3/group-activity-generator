export interface Friend {
  id: string
  name: string
  likes: string
  dislikes: string
}

export interface Activity {
  title: string
  description: string
  vibe: string
  isWildcard?: boolean
  mapsUrl?: string
}

export interface POI {
  name: string
  type: string
  lat: number
  lon: number
}