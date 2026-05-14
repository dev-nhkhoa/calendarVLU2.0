'use client'

import Link from 'next/link'
import { Calendar, Chrome } from 'lucide-react'
import { Button } from './ui/button'

export default function HeaderPage() {
  return (
    <header className="px-4 sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex h-14 items-center justify-between container mx-auto">
        <Link className="flex items-center mr-6" href="/">
          <Calendar className="h-6 w-6 mr-2" />
          <span className="font-bold">Calendar VLU</span>
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Trang chủ
          </Link>
          <Link href="#features" className="text-sm font-medium transition-colors hover:text-primary hidden sm:inline-block">
            Tính năng
          </Link>
          <Link href="#faq" className="text-sm font-medium transition-colors hover:text-primary hidden sm:inline-block">
            FAQ
          </Link>
          <Button size="sm" asChild>
            <Link href="#install">
              <Chrome className="mr-1 h-4 w-4" />
              Cài đặt
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
