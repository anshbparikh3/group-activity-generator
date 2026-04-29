import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-emerald-950 px-4 py-16 text-zinc-100">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-none border border-zinc-200 bg-white p-12 text-emerald-950 shadow-2xl shadow-black/10">
          <h1 className="text-4xl font-source-sans font-extrabold mb-8 tracking-tight">
            About the Author
          </h1>
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <div className="flex-shrink-0 h-40 w-40 overflow-hidden rounded-none bg-zinc-100">
              <Image
                src="/ansh-headshot.jpg"
                alt="Ansh Parikh headshot"
                width={160}
                height={160}
                className="h-full w-full object-cover"
                style={{ objectPosition: 'center 20%' }}
              />
            </div>
            <div className="md:flex-1">
              <p className="text-lg leading-9 font-source-sans">
                Hi, my name is Ansh Parikh, a freshman at Carnegie Mellon University studying Business Administration in the Tepper School of Business with an additional major in Statistics & Data Science. I created this website as a deliverable for Commvault, with the goal of hopefully earning a Product Strategy internship.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
