import type React from "react"
import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

// Font definitions moved from CSS to layout
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ConnectAPI - Enterprise API Solutions",
  description:
    "Enterprise-grade API solutions for modern businesses. Connect with customers seamlessly across multiple channels.",
  keywords: "API, WhatsApp API, messaging API, business API, enterprise API",
  authors: [{ name: "ConnectAPI Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://connectapi.com",
    title: "ConnectAPI - Enterprise API Solutions",
    description: "Enterprise-grade API solutions for modern businesses",
    siteName: "ConnectAPI",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConnectAPI - Enterprise API Solutions",
    description: "Enterprise-grade API solutions for modern businesses",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
