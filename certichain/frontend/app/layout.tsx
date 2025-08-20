import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CertiChain',
  description: 'AI + Blockchain powered certificate verification',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-gray-950 text-gray-100">{children}</body>
    </html>
  )
}

