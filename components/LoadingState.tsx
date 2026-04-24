export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white border border-zinc-200">
      <div className="w-12 h-12 mb-8 border-[3px] border-zinc-100 border-t-beige animate-spin"></div>
      <p className="text-xl font-poppins font-bold text-emerald-950 mb-3 tracking-tight">Generating Results</p>
      <p className="text-zinc-500 font-source-sans text-lg">Analyzing your group's interests and nearby places</p>
    </div>
  )
}