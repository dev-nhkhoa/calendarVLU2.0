import type React from 'react'
import { Header } from '@/components/header'
import Footer from '@/components/footer'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col min-h-screen min-w-screen justify-between">
      <Header />
      {children}
      <Footer />
    </main>
  )
}
