import Link from 'next/link'
import { Chrome } from 'lucide-react'

export default function ConvertPage() {
  return (
    <div className="container mx-auto px-4 py-10 flex flex-col items-center text-center">
      <div className="max-w-lg">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 mb-6">
          <Chrome className="h-8 w-8 mx-auto mb-3" />
          <p className="font-semibold text-base mb-2">Phương thức này đã được thay thế</p>
          <p className="mt-1 leading-relaxed">
            Để đồng bộ lịch VLU an toàn và không cần nhập mật khẩu, vui lòng sử dụng{' '}
            <Link href="/#install" className="underline font-medium">
              tiện ích Chrome Calendar VLU
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
