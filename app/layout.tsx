import type { Metadata } from "next";
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
      {/* Updated to a deep, dark forest green background with light text */}
      <body className={`${poppins.variable} ${sourceSans.variable} font-source-sans bg-emerald-950 text-zinc-100`}>
        {children}
      </body>
    </html>
  );
}