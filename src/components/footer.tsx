import Link from 'next/link'
import React from 'react'
import { Github } from 'lucide-react'

export default function FooterPage() {
  return (
    <footer className="w-full border-t border-black/10 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-black/60">
          Dự án open source, xây để giúp import lịch VLU nhanh hơn.
        </p>
        <div className="flex items-center gap-4 text-sm text-black/70">
          <Link href="/privacy-policy" className="hover:text-black">Chính sách bảo mật</Link>
          <Link href="/terms" className="hover:text-black">Điều khoản</Link>
          <Link href="https://github.com/nhkhoa/calendarVLU" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-black">
            <Github className="h-4 w-4" />
            Source
          </Link>
        </div>
      </div>
    </footer>
  )
}
