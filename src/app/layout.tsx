import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apple Newton - iOS Build Platform",
  description: "Build and distribute iOS apps via TestFlight",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
