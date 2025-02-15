import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import type React from 'react'
import { SessionProvider } from 'next-auth/react'
import { AppProvider } from '@/app-provider'
import { ToastContainer } from 'react-toastify'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CalendarVLU2.0',
  description: 'Convert Van Lang University calendar to various formats',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <AppProvider>
            {children}
            <ToastContainer autoClose={1500} />
          </AppProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
