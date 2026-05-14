import Link from 'next/link'
import React from 'react'

export default function FooterPage() {
  return (
    <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-center sm:text-left text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Calendar VLU. All rights reserved.
        </p>
        <nav className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
          <Link href="/privacy-policy" className="hover:underline">
            Chính sách Bảo mật
          </Link>
          <Link href="/terms" className="hover:underline">
            Điều khoản Dịch vụ
          </Link>
        </nav>
      </div>
    </footer>
  )
}
