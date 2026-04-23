import { Activity } from '@/app/page'

interface ResultsProps {
  activities: Activity[]
}

export default function Results({ activities }: ResultsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">✨ Your Perfect Activities</h2>
        <p className="text-gray-600">Based on your group&apos;s interests and location</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activities.map((activity, index) => (
          <div
            key={index}
            className={`relative p-6 rounded-lg shadow-lg transform transition-all hover:scale-105 ${
              activity.isWildcard
                ? 'bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 text-white'
                : 'bg-white text-gray-800'
            }`}
          >
            {/* Card Badge */}
            <div className="absolute -top-3 -right-3">
              <span
                className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${
                  activity.isWildcard
                    ? 'bg-yellow-300 text-yellow-900'
                    : 'bg-blue-200 text-blue-900'
                }`}
              >
                {activity.isWildcard ? '🎲 Wildcard' : `#${index + 1}`}
              </span>
            </div>

            {/* Activity Title */}
            <h3 className="text-2xl font-bold mb-3 pr-20">{activity.title}</h3>

            {/* Description */}
            <p className={`mb-4 text-lg leading-relaxed ${activity.isWildcard ? 'text-white' : 'text-gray-700'}`}>
              {activity.description}
            </p>

            {/* Vibe Tag */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold uppercase tracking-wide opacity-75">
                Vibe:
              </span>
              <span
                className={`inline-block px-4 py-2 rounded-full font-semibold ${
                  activity.isWildcard
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800'
                }`}
              >
                {activity.vibe}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all"
        >
          Generate New Activities
        </button>
      </div>
    </div>
  )
}
