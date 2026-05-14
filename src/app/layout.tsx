import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import type React from 'react'
import { SessionProvider } from 'next-auth/react'
import { AppProvider } from '@/app-provider'
import { ToastContainer } from 'react-toastify'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const nunito = Nunito({ subsets: ['latin'] })

const siteUrl = 'https://calendar-vlu.nhkhoa.site'

export const metadata: Metadata = {
  title: {
    default: 'CalendarVLU - Import lịch học, lịch thi VLU sang Google Calendar và Outlook',
    template: '%s | CalendarVLU',
  },
  description:
    'CalendarVLU giúp sinh viên Văn Lang import lịch học và lịch thi từ VLU Calendar sang Google Calendar và Outlook.',
  keywords: [
    'CalendarVLU',
    'VLU',
    'Van Lang University',
    'calendar',
    'lịch học',
    'lịch thi',
    'Google Calendar',
    'Outlook',
    'Chrome extension',
    'import lịch',
    'trường đại học Văn Lang',
  ],
  authors: [{ name: 'CalendarVLU' }],
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/favicon/site.webmanifest',
  openGraph: {
    title: 'CalendarVLU - Import lịch học, lịch thi VLU sang Google Calendar và Outlook',
    description:
      'CalendarVLU giúp sinh viên Văn Lang đưa lịch học và lịch thi lên Google Calendar và Outlook.',
    url: siteUrl,
    siteName: 'CalendarVLU',
    locale: 'vi_VN',
    type: 'website',
    images: [{ url: '/logo.png', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CalendarVLU - Import lịch học, lịch thi VLU sang Google Calendar và Outlook',
    description:
      'CalendarVLU giúp sinh viên Văn Lang đưa lịch học và lịch thi lên Google Calendar và Outlook.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body className={nunito.className}>
        <SessionProvider>
          <AppProvider>
            {children}
            <ToastContainer autoClose={1500} />
          </AppProvider>
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
