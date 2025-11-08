export const runtime = "edge";

import "./globals.css";
import React from "react";

export const metadata = {
  title: "Wordle Multiplayer",
  description: "Online multiplayer Wordle",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="mx-auto max-w-6xl px-4">
          <header className="h-14 flex items-center justify-center border-b border-neutral-800 mb-4">
            <h1 className="text-2xl tracking-widest font-extrabold">WORDLE</h1>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
