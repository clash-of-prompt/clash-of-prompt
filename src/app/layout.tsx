import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prompt Wars - AI Battle Arena",
  description:
    "Turn-based battle game where your creativity is your weapon. Fight monsters using natural language prompts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="crt-flicker">{children}</body>
    </html>
  );
}
