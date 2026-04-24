# Group Activity Generator — App Architecture & Flow

This document explains how the app works in detail, from user interaction to data fetching, AI prompt generation, and rendering.

## 1. High-Level Purpose

The app helps a small group of friends decide on a local activity by combining:
- browser location or manual zip-code lookup,
- friend interest profiles,
- nearby venue discovery from OpenStreetMap,
- and an LLM recommendation step via the Groq API.

The output is a set of curated activity suggestions, including one wildcard activity.

## 2. File Structure Overview

Important source files:
- `app/page.tsx` — main page and app state logic
- `app/type.ts` — shared TypeScript types for friends, activities, and POIs
- `components/Header.tsx` — location display and zip-code input form
- `components/FriendForm.tsx` — friend profile management UI
- `components/LoadingState.tsx` — loading animation while generating results
- `components/Results.tsx` — activity result cards and reset button
- `vercel.json` — Vercel deployment settings
- `.env.local` — stores the Groq API key (not committed)

## 3. Main Page Logic (`app/page.tsx`)

### 3.1 React State

The page maintains these state values:
- `location` — stores city name plus latitude/longitude
- `friends` — array of friend profile objects
- `activities` — array of generated activity suggestions
- `loading` — flag for waiting on AI/POI processing
- `error` — any validation or fetch errors shown to the user

### 3.2 Location Flow

#### Browser geolocation
On initial mount, `useEffect` calls `getLocationFromBrowser()`.
- If the browser supports geolocation, it calls `navigator.geolocation.getCurrentPosition`.
- If the user allows it, the app gets coordinates and calls `reverseGeocode(lat, lon)`.
- If geolocation is denied, the app logs a notice and waits for manual zip input.

#### Reverse geocoding
`reverseGeocode(lat, lon)`:
- Fetches from Nominatim:
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
- Reads the returned `address` object and constructs a city label.
- Saves `{ city, lat, lon }` into `location`.

#### Zip code fallback
`handleZipCodeSubmit(zipCode)`:
- Fetches from Nominatim search API with `postalcode` and `countrycodes=us`.
- If results exist, it parses coordinates and city data.
- Sets `location` and clears any previous error.
- If no result, it sets an error message.

### 3.3 Friend Profile Management

The app expects at least 2 friends before generating suggestions.

Helper functions:
- `addFriend(friend)` — appends a new friend profile
- `updateFriend(id, updated)` — updates an existing friend in the list
- `removeFriend(id)` — deletes a friend profile

Friend profiles are represented by the `Friend` type from `app/type.ts`:
- `id`
- `name`
- `likes`
- `dislikes`

### 3.4 Generating Activities

`generateActivities()` does this:
1. Validates that `location` exists and at least 2 friend profiles are present.
2. Sets `loading` and clears any previous error.
3. Calls `fetchNearbyPOIs(location.lat, location.lon)`.
4. Calls `callGroqAPI(pois, friends, location.city)`.
5. Stores the returned activity list in `activities`.
6. Resets `loading` when complete.

If any step fails, the error message is shown in the UI.

## 4. POI Discovery (`fetchNearbyPOIs`)

This function queries the OpenStreetMap Overpass API to discover venues near the selected coordinates.

### Query details
The query searches for nodes within an 8km radius using tags like:
- `amenity=cafe`
- `amenity=restaurant`
- `leisure=park`
- `amenity=museum`
- `amenity=bar`
- `shop=books`
- `amenity=cinema`
- `amenity=gym`
- `leisure=bowling_alley`
- `leisure=sports_centre`

### Post-processing
The response is filtered to include only objects with:
- `tags.name`
- `lat` / `lon`

It converts results into the `POI` type:
- `name`
- `type`
- `lat`
- `lon`

Then it removes duplicate names and keeps up to 30 POIs.

If the Overpass call fails, it returns an empty list and logs the failure.

## 5. AI Integration (`callGroqAPI`)

This function sends the POIs and friend profiles to Groq’s chat API.

### Environment key
The app uses `process.env.NEXT_PUBLIC_GROQ_API_KEY`.
- If the API key is missing or still the placeholder, the app returns a fallback activity.
- This allows the UI to work without the Groq key.

### Prompt structure
The prompt includes:
- current city
- friends and their likes/dislikes
- nearby venues as a numbered list with IDs
- a strict instruction to return only valid JSON
- a requirement to choose from provided venues
- a format with 4 recommendations: 3 consensus + 1 wildcard

### API request
It calls:
- `https://api.groq.com/openai/v1/chat/completions`
- request body contains model `llama-3.1-8b-instant`
- `temperature: 0.7`
- `max_tokens: 1024`
- `response_format: { type: 'json_object' }`

### Parsing results
The app expects the returned JSON to match:
```json
{ "activities": [ { "poiId": <number>, "title": "...", "description": "..." } ] }
```

It then maps each activity:
- attaches the POI’s coordinates to build a Google Maps URL
- marks the last item as `isWildcard`

If JSON parsing fails, the app throws an error and displays it.

## 6. Shared Types (`app/type.ts`)

These are the core type definitions used across the app:

`Friend`
- `id`
- `name`
- `likes`
- `dislikes`

`Activity`
- `title`
- `description`
- `vibe` (currently unused in the UI but still present)
- `isWildcard?`
- `mapsUrl?`

`POI`
- `name`
- `type`
- `lat`
- `lon`

## 7. UI Components

### `Header.tsx`

Responsible for:
- showing current location
- letting user change location via zip code
- hiding the location button once results are generated

Props:
- `location`
- `onUpdateLocation(zipCode)`
- `hideChangeLocation?`

It toggles the zip-code input based on whether location is known.

### `FriendForm.tsx`

Responsible for:
- creating, editing, and removing friend profiles
- limiting the group to 5 friends
- requiring name and likes for each profile
- showing optional dislikes

It supports inline editing by populating the form when a user clicks `Edit`.

### `LoadingState.tsx`

Displayed while the app waits for POI loading and AI recommendations.
It renders a spinner and a short status message.

### `Results.tsx`

Responsible for rendering the final activity cards.
Each card shows:
- the activity title
- a Google Maps link
- a description
- a wildcard badge for the last item

It also includes a `Reset Session` button that reloads the page.

## 8. Deployment and Environment

### Vercel config
`vercel.json` includes only these settings:
- `buildCommand: next build`
- `outputDirectory: .next`
- `devCommand: next dev --port $PORT`
- `framework: nextjs`

### Environment variable
The app uses:
- `NEXT_PUBLIC_GROQ_API_KEY`

This is loaded from `.env.local` locally and must be configured in Vercel under project settings.

### `.gitignore`
The app ignores:
- `.next/`
- `node_modules/`
- `.env*`
- `.vercel`
- build output folders

So the API key is not committed.

## 9. User Flow Summary

1. App loads.
2. Browser geolocation is requested.
3. If accepted, city is resolved and displayed.
4. If denied, the user enters a zip code.
5. The user adds friend profiles (2–5 friends).
6. The user clicks `Generate Activities`.
7. The app fetches nearby POIs from Overpass.
8. The app sends POIs + friend profiles to Groq.
9. The app renders 4 activity recommendations.
10. The user can reset and start again.

## 10. Key Behavior Notes

- The app is intentionally stateless.
- All user input lives only in the browser session.
- If the Groq key is missing, the UI still shows placeholder recommendations.
- Only the last recommendation is labeled as wildcard.
- Location is primary; without it, the app cannot generate results.

## 11. Troubleshooting

### Build issue on Vercel
- The app previously failed because of unescaped apostrophes in JSX.
- This was fixed by replacing `'` with `&apos;` in `LoadingState.tsx` and `Results.tsx`.

### GitHub and Vercel
- The repo has been pushed to GitHub.
- Vercel deployment depends on the `NEXT_PUBLIC_GROQ_API_KEY` secret.

## 12. What to explain tomorrow

Use this narrative:
- the app collects group data and local context,
- it finds local venues via OpenStreetMap,
- then it asks an LLM to turn venue + interests into activity ideas,
- finally it shows a clean result UI with one unexpected wildcard suggestion.

That covers both the UX and the implementation.
