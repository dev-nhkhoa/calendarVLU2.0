import FooterPage from '@/components/footer'
import HeaderPage from '@/components/header'
import type React from 'react'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col min-h-screen min-w-screen justify-between">
      <HeaderPage />
      {children}
      <FooterPage />
    </main>
  )
}
