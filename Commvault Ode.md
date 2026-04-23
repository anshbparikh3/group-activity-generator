**Objective:** Build a group-activity generator web app using Next.js, TailwindCSS, and Groq API

**Workflow:**

1. Location fetching: Use browser’s geolocation (potentially API) to get coordinates. Convert to a city name using a free reverse-geocoding API (potentially OpenStreetMap)  
2. User input: Dynamic form where a user can add 2-5 “friend profiles.” Each profile contains text area for interests (i.e. coffee, hates hiking, thrifting, etc)  
3. Discovery engine: Use OpenStreetMap API to fetch nearby POIs based on user’s coordinates. Send list of nearby POIs and group interests to Groq (Llama 3\)  
4. LLM logic: LLM must find 3 activities that satisfy the most interests. LLM must suggest 1 “wildcard” activity (something unique). Output must be a valid JSON to render clean UI

**Tech Stack:**

1. Frontend: React components styled with Tailwind. Make it work primarily for laptops.  
2. Backend: Not needed for demo  
3. Deployment: Vercel

**Location Stack:**

1. Reverse geocoding: https://nominatim.openstreetmap.org/reverse?format=json\&lat={lat}\&lon={lon}  
2. Local data: Overpass API

**Groq Prompt:** "You are a local expert and social coordinator. I will provide a list of local venues and a list of hobbies for 2-5 friends. Your goal is to return a JSON object with 4 recommendations: 3 based on group consensus and 1 'Wildcard' recommendation that is unexpected but fun. Each recommendation needs a title, a 'Why this works' description, and a 'Vibe' tag (e.g., Chill, High Energy)."

**Suggested UI Layout:**

1. Header: Location display with an update location button  
2. Stepper: “Add Friend” interface  
3. Loading state: Loading animation/screen when waiting for results  
4. Result cards