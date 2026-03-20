import type { Metadata } from "next";
import "./globals.css";
import I18nProvider from "@/components/I18nProvider";

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
      <body className="crt-flicker">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
