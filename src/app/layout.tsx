import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import type React from 'react'
import { SessionProvider } from 'next-auth/react'
import { AppProvider } from '@/app-provider'
import { ToastContainer } from 'react-toastify'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = 'https://calen-vlu.nhkhoa.live'

export const metadata: Metadata = {
  title: {
    default: 'Calendar VLU - Đồng bộ lịch VLU an toàn với Google Calendar',
    template: '%s | Calendar VLU',
  },
  description:
    'Đồng bộ lịch học và lịch thi VLU với Google Calendar một cách an toàn qua tiện ích Chrome. Không cần nhập mật khẩu VLU vào website của bên thứ ba.',
  keywords: [
    'VLU',
    'Van Lang University',
    'calendar',
    'lịch học',
    'lịch thi',
    'Google Calendar',
    'Chrome extension',
    'đồng bộ lịch',
    'trường đại học Văn Lang',
  ],
  authors: [{ name: 'Calendar VLU' }],
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'Calendar VLU - Đồng bộ lịch VLU an toàn với Google Calendar',
    description:
      'Đồng bộ lịch học và lịch thi VLU với Google Calendar qua tiện ích Chrome. Bảo mật hơn, không cần nhập mật khẩu VLU.',
    url: siteUrl,
    siteName: 'Calendar VLU',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calendar VLU - Đồng bộ lịch VLU an toàn',
    description:
      'Đồng bộ lịch học và lịch thi VLU với Google Calendar qua tiện ích Chrome.',
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
      <body className={inter.className}>
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
