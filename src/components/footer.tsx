import Link from 'next/link'
import React from 'react'

export default function FooterPage() {
  return (
    <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
      <p className="text-center">
        Xem{' '}
        <Link href="/privacy-policy" className="text-blue-400 underline">
          Chính sách bảo mật
        </Link>{' '}
        của chúng tôi để biết thêm thông tin về cách chúng tôi xử lý dữ liệu của bạn.
      </p>
      <p className="text-xs text-center text-gray-500 dark:text-gray-400">© 2025 calendarVLU. All rights reserved.</p>
    </footer>
  )
}
