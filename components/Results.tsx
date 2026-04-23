import { Activity } from '../app/type'

interface ResultsProps {
  activities: Activity[]
}

export default function Results({ activities }: ResultsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-slate-100 mb-2 tracking-tight">✨ Recommended Output</h2>
        <p className="text-slate-400 font-medium">Optimized for your group's parameters</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activities.map((activity, index) => {
          // FIXED: Safe fallback map URL
          const safeMapsUrl = activity.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.title)}`

          return (
            <div
              key={index}
              className={`relative p-7 rounded-2xl backdrop-blur-xl border transition-all hover:-translate-y-1 hover:shadow-2xl ${
                activity.isWildcard
                  ? 'bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.15)]'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="absolute -top-3 -right-3">
                <span
                  className={`inline-block px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg ${
                    activity.isWildcard
                      ? 'bg-indigo-500 border border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {activity.isWildcard ? '🎲 Wildcard' : `Option ${index + 1}`}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-4 pr-20">
                <h3 className="text-2xl font-bold text-slate-100">{activity.title}</h3>
                <a
                  href={safeMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-slate-800 text-blue-400 border border-slate-700 hover:bg-slate-700 hover:text-blue-300"
                >
                  📍 Open Maps
                </a>
              </div>

              <p className="mb-6 text-lg leading-relaxed text-slate-300">
                {activity.description}
              </p>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Vibe Tag
                </span>
                <span className="inline-block px-3 py-1 rounded-md text-sm font-semibold bg-slate-950 border border-slate-800 text-blue-400">
                  {activity.vibe}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-4 mt-10">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 py-4 px-6 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl font-bold text-lg hover:bg-slate-700 hover:text-white transition-all shadow-lg"
        >
          Reset Session
        </button>
      </div>
    </div>
  )
}