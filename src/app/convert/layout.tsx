import type React from 'react'
import HeaderPage from '@/components/header'
import FooterPage from '@/components/footer'

export default function ConvertLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col min-h-screen min-w-screen justify-between">
      <HeaderPage />
      {children}
      <FooterPage />
    </main>
  )
}
