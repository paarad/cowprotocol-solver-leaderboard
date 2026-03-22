import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "CoW Solver Leaderboard",
  description:
    "Live competition rankings for CoW Protocol batch auction solvers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} antialiased bg-[#1b1e2e] text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
