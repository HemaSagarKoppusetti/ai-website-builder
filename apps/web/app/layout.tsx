import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from 'sonner'
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "AI Website Builder - Create Stunning Websites with AI",
  description: "The most advanced no-code website builder powered by AI. Create professional websites with drag-and-drop, templates, real-time preview, and one-click deployment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
