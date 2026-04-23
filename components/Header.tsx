import { useState } from 'react'

interface HeaderProps {
  location: { city: string; lat: number; lon: number } | null
  onUpdateLocation: (zipCode: string) => void
}

export default function Header({ location, onUpdateLocation }: HeaderProps) {
  const [showZipInput, setShowZipInput] = useState(!location)
  const [zipCode, setZipCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (zipCode.trim()) {
      onUpdateLocation(zipCode)
      setZipCode('')
      setShowZipInput(false)
    }
  }

  return (
    <header className="mb-8 bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-4xl font-bold mb-2 text-gray-800">🎉 Group Activity Generator</h1>
      <p className="text-gray-600 mb-4">Find the perfect activity that everyone will love!</p>

      <div className="flex items-center justify-between">
        {location && !showZipInput ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-gray-600 text-sm">Current Location</p>
                <p className="text-xl font-semibold text-gray-800">{location.city}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Location not set</p>
        )}

        {showZipInput && (
          <form onSubmit={handleSubmit} className="flex gap-2 flex-1 ml-4">
            <input
              type="text"
              placeholder="Enter zip code..."
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Set Location
            </button>
          </form>
        )}

        {location && !showZipInput && (
          <button
            onClick={() => setShowZipInput(true)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Change Location
          </button>
        )}
      </div>
    </header>
  )
}
