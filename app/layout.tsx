import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://booking.primakavi.de"),
  title: "primakavi booking",
  description: "Shows, Akten und Tourplanung an einem Ort.",
  openGraph: {
    title: "primakavi booking",
    description: "Shows, Akten und Tourplanung an einem Ort.",
    url: "https://booking.primakavi.de",
    siteName: "primakavi booking",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "primakavi booking",
      },
    ],
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "primakavi booking",
    description: "Shows, Akten und Tourplanung an einem Ort.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
