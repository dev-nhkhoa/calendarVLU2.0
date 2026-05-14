'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { vluAccountType } from '@/types/account'
import { toast } from 'react-toastify'
import { Chrome } from 'lucide-react'
import Link from 'next/link'

const formSchema = z.object({
  vanlang_id: z.string(),
  vanlang_password: z.string(),
})

interface VanLangLoginFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setVluAccount: (vluAccount: vluAccountType | null) => void
}

export default function VanLangLoginForm({ setOpen, setVluAccount }: VanLangLoginFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { vanlang_id, vanlang_password } = values
      const checkVLUAccount = await fetch(`/api/accounts/vlu?id=${vanlang_id}&password=${vanlang_password}`, { method: 'GET' })

      if (!checkVLUAccount.ok) {
        toast.error('Đăng nhập thất bại, vui lòng kiểm tra lại thông tin')
        return
      }

      const cookie = (await checkVLUAccount.json()) as string

      setVluAccount({ id: vanlang_id, password: vanlang_password, cookie })
      toast.success('Đăng nhập thành công!')

      form.reset()
    } catch (error) {
      console.error('Form submission error', error)
      toast.error('Đã có lỗi xảy ra, vui lòng thử lại sau')
    } finally {
      setOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        <p className="font-semibold">Phương thức này sẽ bị loại bỏ</p>
        <p className="mt-1">
          Nhập mật khẩu VLU trên website bên thứ ba tiềm ẩn rủi ro bảo mật. Vui lòng sử dụng{' '}
          <Link href="#install" className="underline font-medium">
            tiện ích Chrome
          </Link>{' '}
          để đồng bộ an toàn hơn.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">
          <FormField
            control={form.control}
            name="vanlang_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã số sinh viên</FormLabel>
                <FormControl>
                  <Input placeholder="2xxxxxxxxxxx" type="text" {...field} />
                </FormControl>
                <FormDescription>Vui lòng nhập mã số sinh viên</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vanlang_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu</FormLabel>
                <FormControl>
                  <Input placeholder="your-password" {...field} type="password" />
                </FormControl>
                <FormDescription>Vui lòng nhập mật khẩu</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <Button type="submit" className="w-full">
              Đăng nhập
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/#install">
                <Chrome className="mr-2 h-4 w-4" />
                Dùng tiện ích Chrome (khuyên dùng)
              </Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
