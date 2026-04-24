import { Activity } from '../app/type'

interface ResultsProps {
  activities: Activity[]
}

export default function Results({ activities }: ResultsProps) {
  return (
    <div className="space-y-8">
      <div className="mb-10 border-b border-emerald-800/50 pb-8">
        <h2 className="text-4xl font-poppins font-extrabold text-beige mb-3 tracking-tighter">Recommended Activities</h2>
        <p className="text-zinc-300 font-source-sans text-lg">These results optimize your group’s interests</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activities.map((activity, index) => {
          const safeMapsUrl = activity.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(activity.title)}`

          return (
            <div
              key={index}
              className={`relative p-10 border transition-all ${
                activity.isWildcard
                  // Uses the exact compiled HEX color so it stays light and solid!
                  ? 'bg-[#e6edeb] border-emerald-900/20 text-emerald-950'
                  : 'bg-white border-zinc-200 text-emerald-950 hover:border-zinc-400'
              }`}
            >
              <div className="mb-6">
                <span
                  className={`inline-block px-4 py-1 font-poppins text-xs font-bold tracking-widest uppercase border ${
                    activity.isWildcard
                      ? 'bg-emerald-950 text-beige border-emerald-950'
                      : 'bg-emerald-900/10 text-emerald-950 border-emerald-900/20'
                  }`}
                >
                  {activity.isWildcard ? 'Try Something Unique' : `Option ${index + 1}`}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
                <h3 className="text-3xl font-poppins font-bold tracking-tight text-emerald-950">
                  {activity.title}
                </h3>
                <a
                  href={safeMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center flex-shrink-0 px-6 py-3 font-poppins text-xs font-bold uppercase tracking-widest transition-colors border ${
                    activity.isWildcard
                      ? 'bg-emerald-950 text-beige border-emerald-950 hover:bg-emerald-900'
                      : 'bg-white text-emerald-950 border-zinc-300 hover:bg-emerald-900/10'
                  }`}
                >
                  Open in Google Maps
                </a>
              </div>

              <p className={`text-lg leading-relaxed font-source-sans ${activity.isWildcard ? 'text-emerald-900' : 'text-zinc-600'}`}>
                {activity.description}
              </p>
            </div>
          )
        })}
      </div>

      <div className="flex gap-4 mt-12">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 py-5 px-6 bg-beige text-emerald-950 font-poppins font-bold uppercase tracking-widest text-sm hover:bg-beige-dark transition-colors"
        >
          Reset Session
        </button>
      </div>
    </div>
  )
}
    // yooo