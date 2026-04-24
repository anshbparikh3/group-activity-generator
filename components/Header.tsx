import { useState, useEffect } from 'react'

interface HeaderProps {
  location: { city: string; lat: number; lon: number } | null
  onUpdateLocation: (zipCode: string) => void
  hideChangeLocation?: boolean
}

export default function Header({ location, onUpdateLocation, hideChangeLocation = false }: HeaderProps) {
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
    <header className="mb-12 bg-white border border-zinc-200 p-10">
      <h1 className="text-5xl sm:text-6xl font-poppins font-extrabold mb-4 text-emerald-950 tracking-tighter">
        Group Activity Generator
      </h1>
      <p className="text-zinc-500 mb-10 font-medium font-source-sans text-lg">Can’t decide what to do with your friends? Ask us!</p>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {location && !showZipInput ? (
          <div className="flex items-center gap-4">
            <div>
              <p className="text-zinc-500 font-poppins text-xs font-bold uppercase tracking-widest mb-1">Current Location</p>
              <p className="text-xl font-poppins font-bold text-emerald-950">{location.city}</p>
            </div>
          </div>
        ) : (
          <p className="text-zinc-500 font-source-sans font-medium uppercase tracking-widest text-sm">Awaiting location</p>
        )}

        {showZipInput && (
          <form onSubmit={handleSubmit} className="flex gap-4 flex-1 sm:ml-8">
            <input
              type="text"
              placeholder="Enter zip code..."
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="flex-1 px-5 py-3 bg-zinc-50 border border-zinc-200 text-emerald-950 focus:outline-none focus:border-emerald-900 focus:ring-1 focus:ring-emerald-900 transition-colors font-source-sans"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-emerald-900 text-white font-poppins font-bold uppercase tracking-wider text-sm hover:bg-emerald-800 transition-colors"
            >
              Set Location
            </button>
          </form>
        )}

        {/* Updated condition to hide the button if hideChangeLocation is true */}
        {location && !showZipInput && !hideChangeLocation && (
          <button
            onClick={() => setShowZipInput(true)}
            className="px-8 py-3 bg-beige text-emerald-950 border border-beige font-poppins font-bold uppercase tracking-wider text-sm hover:bg-beige-dark transition-colors"
          >
            Change Location
          </button>
        )}
      </div>
    </header>
  )
}