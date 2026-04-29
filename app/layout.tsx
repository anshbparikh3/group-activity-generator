import type { Metadata } from "next";
import Link from "next/link";
import { Poppins, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ['400', '600', '700', '800'],
  subsets: ["latin"],
  variable: "--font-poppins"
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans"
});

export const metadata: Metadata = {
  title: "Group Activity Generator",
  description: "Can’t decide what to do with your friends? Ask us!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${sourceSans.variable} font-source-sans bg-emerald-950 text-zinc-100`}>
        <div className="min-h-screen">
          <nav className="bg-beige text-emerald-950 border-b border-emerald-900/20">
            <div className="max-w-4xl mx-auto px-4 py-[0.45rem] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="rounded-none bg-emerald-950/95 px-3 py-[0.45rem] h-full flex items-center text-center sm:text-left">
                <div className="text-[0.72rem] sm:text-xs md:text-sm font-poppins font-bold uppercase tracking-[0.18em] leading-tight text-emerald-200">
                  <span className="block">Commvault Product</span>
                  <span className="block">Strategy Deliverable</span>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <Link
                  href="/"
                  className="nav-link text-[0.65rem] sm:text-[0.75rem] lg:text-sm font-source-sans font-bold tracking-[0.22em] text-emerald-950 flex flex-col items-center text-center"
                >
                  <span className="leading-tight">Group Activity</span>
                  <span className="leading-tight">Generator</span>
                </Link>
                <Link
                  href="/about"
                  className="nav-link text-[0.65rem] sm:text-[0.75rem] lg:text-sm font-source-sans font-bold tracking-[0.22em] text-emerald-950 flex flex-col items-center text-center"
                >
                  <span className="leading-tight">About the</span>
                  <span className="leading-tight">Author</span>
                </Link>
              </div>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
