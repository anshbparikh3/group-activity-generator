import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Group Activity Generator",
  description: "Find the perfect activity that everyone will love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950`}>
        {children}
      </body>
    </html>
  );
}