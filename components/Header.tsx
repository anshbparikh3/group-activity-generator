import { useState, useEffect } from 'react'

interface HeaderProps {
  location: { city: string; lat: number; lon: number } | null
  onUpdateLocation: (zipCode: string) => void
}

export default function Header({ location, onUpdateLocation }: HeaderProps) {
  const [showZipInput, setShowZipInput] = useState(!location)
  const [zipCode, setZipCode] = useState('')

  useEffect(() => {
    if (location) {
      setShowZipInput(false)
    }
  }, [location])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (zipCode.trim()) {
      onUpdateLocation(zipCode)
      setZipCode('')
      setShowZipInput(false)
    }
  }

  return (
    <header className="mb-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6">
      <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
        Group Activity Generator
      </h1>
      <p className="text-slate-400 mb-6 font-medium">Optimize your group's social coordination.</p>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {location && !showZipInput ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Current Location</p>
                <p className="text-xl font-bold text-slate-100">{location.city}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 font-medium">Awaiting location parameters...</p>
        )}

        {showZipInput && (
          <form onSubmit={handleSubmit} className="flex gap-3 flex-1 sm:ml-4">
            <input
              type="text"
              placeholder="Enter zip code..."
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-600 transition-all shadow-inner"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all"
            >
              Set Location
            </button>
          </form>
        )}

        {location && !showZipInput && (
          <button
            onClick={() => setShowZipInput(true)}
            className="px-5 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg font-semibold hover:bg-slate-700 hover:text-white transition-all"
          >
            Update
          </button>
        )}
      </div>
    </header>
  )
}