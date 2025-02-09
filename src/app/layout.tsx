import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import type React from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CalendarVLU2.0',
  description: 'Convert Van Lang University calendar to various formats',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="relative min-h-screen flex flex-col">
          <main className="flex-grow">{children}</main>
        </div>
      </body>
    </html>
  )
}
