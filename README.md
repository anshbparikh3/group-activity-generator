# 🎉 Group Activity Generator

A Next.js web application that helps groups of 2-5 friends discover the perfect activity together based on their location and interests.

## Features

✨ **Smart Location Detection**
- Auto-detects location via browser geolocation
- Fallback to zip code input if geolocation is denied

👥 **Friend Profiles**
- Add up to 5 friends with their interests and preferences
- Edit and remove friends as needed
- Dynamic form interface

🗺️ **Local Discovery**
- Fetches nearby POIs (restaurants, cafes, parks, museums, etc.) using OpenStreetMap
- Analyzes venue data to find group consensus activities

🤖 **AI-Powered Recommendations**
- Uses Groq API with Llama 3 to generate activity suggestions
- Returns 3 consensus activities + 1 wildcard recommendation
- Each activity includes title, description, and "vibe" tag

🎨 **Beautiful UI**
- Built with React and styled with Tailwind CSS
- Responsive design optimized for laptops
- Gradient backgrounds and smooth animations
- Clean card-based layout

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS
- **APIs:**
  - [Groq API](https://console.groq.com) - LLM for activity generation
  - [OpenStreetMap Nominatim](https://nominatim.org/release-docs/) - Reverse geocoding
  - [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) - POI discovery
- **Deployment:** Vercel

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

or

```bash
yarn install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then add your Groq API key:

```
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
```

**Getting a Groq API Key:**
1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to the API section and create a new API key
4. Copy the key and paste it in `.env.local`

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Set Your Location**
   - Allow browser geolocation when prompted, OR
   - Enter a US zip code manually

2. **Add Friends**
   - Click "Add Friend" to open the form
   - Enter friend's name and their interests/preferences
   - Add 2-5 friends (you can edit/remove them as needed)

3. **Generate Activities**
   - Click "Generate Activities"
   - Wait for AI to analyze your group and nearby venues
   - View 4 personalized recommendations

4. **Explore Results**
   - See 3 consensus activities + 1 wildcard pick
   - Each activity shows title, why it works, and vibe tag
   - Generate new activities to get different suggestions

## API Key Placeholder

If you don't have a Groq API key yet, the app will use placeholder responses to demonstrate the UI. Once you add your API key, it will use real AI-generated recommendations.

## Deployment to Vercel

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Click "New Project" and import your GitHub repository
4. Add the environment variable `NEXT_PUBLIC_GROQ_API_KEY` in Vercel dashboard
5. Deploy!

```bash
# Or deploy from CLI
npm install -g vercel
vercel
```

## Project Structure

```
.
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page with app logic
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Location display & input
│   ├── FriendForm.tsx      # Friend profile management
│   ├── LoadingState.tsx    # Loading animation
│   └── Results.tsx         # Activity recommendations display
├── public/                 # Static assets
├── .env.example            # Environment variables template
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
└── vercel.json             # Vercel deployment config
```

## Features Coming Soon

- 📱 Mobile optimization
- 🔗 Share activities with friends
- 💾 Save favorite activities
- 🗓️ Activity scheduling
- 📍 More location services
- 🌍 International support
- 🎵 Activity playlists

## Free APIs Used

All APIs used in this project are free:
- **Groq API:** Free tier available (fast inference)
- **OpenStreetMap Nominatim:** Free reverse geocoding
- **Overpass API:** Free POI data

No credit card required to get started!

## Troubleshooting

**Groq API errors?**
- Check that your API key is valid at [https://console.groq.com](https://console.groq.com)
- Ensure rate limits haven't been exceeded
- The app will show an error message if the API fails

**Location not found?**
- Try a different zip code (US only for zip code lookup)
- Allow browser geolocation permissions
- Check your internet connection

**No POIs found?**
- The area might have limited data in OpenStreetMap
- This is expected in very rural areas
- Restart and try nearby city

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
