import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taka Ache? - Find ATMs in Bangladesh | Real-time ATM Status & Cash Availability",
  description: "Discover nearby ATMs in Bangladesh with real-time status updates. Check cash availability, working status, and user reviews. Interactive map for Dhaka, Chittagong, Sylhet & all major cities.",
  keywords: [
    "ATM Bangladesh",
    "ATM finder",
    "cash availability",
    "ATM near me",
    "Bangladesh ATM",
    "Dhaka ATM",
    "ATM status",
    "working ATM",
    "bank ATM",
    "টাকা আছে",
    "এটিএম",
    "বাংলাদেশ এটিএম"
  ],
  authors: [{ name: "Taka Ache Team" }],
  creator: "Taka Ache",
  publisher: "Taka Ache",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/atm-machine.png?v=2' },
      { url: '/atm-machine.png?v=2', sizes: '32x32', type: 'image/png' },
      { url: '/atm-machine.png?v=2', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/atm-machine.png?v=2',
    apple: '/atm-machine.png?v=2',
    other: [
      {
        rel: 'icon',
        url: '/atm-machine.png?v=2',
      },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_BD',
    alternateLocale: ['bn_BD'],
    url: 'https://taka-ache.vercel.app',
    siteName: 'Taka Ache?',
    title: 'Taka Ache? - Find ATMs in Bangladesh',
    description: 'Find nearby ATMs in Bangladesh with real-time cash availability and status updates. Community-driven reviews help you locate working ATMs instantly.',
    images: [
      {
        url: '/atm-machine.png',
        width: 1200,
        height: 630,
        alt: 'Taka Ache - ATM Finder Bangladesh',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Taka Ache? - Find ATMs in Bangladesh',
    description: 'Find nearby ATMs with real-time cash availability and status updates across Bangladesh.',
    images: ['/atm-machine.png'],
    creator: '@takaache',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  category: 'finance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
