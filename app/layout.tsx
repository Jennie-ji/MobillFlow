import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Emmie – AI Warehouse Assistant',
  description: 'Emmie – AI Warehouse Assistant',
  generator: 'Great player good team',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
