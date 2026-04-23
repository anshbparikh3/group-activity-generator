export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-spin opacity-20"></div>
        <div className="absolute inset-2 bg-white rounded-full"></div>
        <div className="absolute inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
      </div>
      <p className="text-lg font-semibold text-gray-800 mb-2">Finding perfect activities...</p>
      <p className="text-gray-600">Analyzing your group&apos;s interests and local venues</p>
    </div>
  )
}
