'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Account } from './settings-form'
import { signIn } from 'next-auth/react'

const formSchema = z.object({
  vanlang_id: z.string(),
  vanlang_password: z.string(),
})

interface VanLangLoginFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setLinkedAccounts: React.Dispatch<React.SetStateAction<Account[]>>
  userEmail: string
}

export default function VanLangLoginForm({ setOpen, setLinkedAccounts, userEmail }: VanLangLoginFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { vanlang_id, vanlang_password } = values
      const checkVLUAccount = await fetch(`/api/check-vlu-account?id=${vanlang_id}&password=${vanlang_password}`, {
        method: 'GET',
      })
      if (!checkVLUAccount.ok) {
        alert('Đăng nhập thất bại, vui lòng kiểm tra lại thông tin')
        return
      }

      console.log(checkVLUAccount)
      const response = await checkVLUAccount.json()
      const cookie = response.cookie as string

      signIn('credentials', { id: vanlang_id, password: vanlang_password, cookie: cookie, userEmail: userEmail })
      setLinkedAccounts((prev) => [...prev, 'vanLang'])
    } catch (error) {
      console.error('Form submission error', error)
      alert('Đã có lỗi xảy ra, vui lòng thử lại sau')
    } finally {
      setOpen(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">
        <FormField
          control={form.control}
          name="vanlang_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã số sinh viên</FormLabel>
              <FormControl>
                <Input placeholder="227xxxxxxxxx" type="text" {...field} />
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

        <Button type="submit" className="w-full">
          Đăng nhập
        </Button>
      </form>
    </Form>
  )
}
