'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Chrome, AlertTriangle } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import VanLangLoginForm from './van-lang-login-form'
import { useApp } from '@/app-provider'
import { toast } from 'react-toastify'
import Link from 'next/link'

export default function SettingsForm() {
  const { user, vluAccount, setVluAccount } = useApp()
  const [open, setOpen] = useState(false)

  if (!user) return <div>Không tìm thấy USER!</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name: {user.name}</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email: {user.email}</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Manage your connected accounts here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <p className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Phương thức nhập mật khẩu VLU sẽ bị loại bỏ
            </p>
            <p className="mt-1">
              Sử dụng{' '}
              <Link href="/#install" className="underline font-medium">
                tiện ích Chrome
              </Link>{' '}
              để đồng bộ an toàn, không cần nhập mật khẩu.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Mail className="h-6 w-6" />
              <span>Van Lang Account</span>
            </div>
            {vluAccount == null ? (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Link Account</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Liên kết tài khoản VLU ( online.vlu.edu.vn )</DialogTitle>
                    <DialogDescription>Liên kết tài khoản VLU của bạn nhằm mục đích trích xuất lịch học, lịch thi của bạn.</DialogDescription>
                  </DialogHeader>
                  <VanLangLoginForm setOpen={setOpen} setVluAccount={setVluAccount} />
                </DialogContent>
              </Dialog>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" disabled>
                  <Chrome className="mr-2 h-4 w-4" />
                  Chuyển sang tiện ích
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setVluAccount(null)
                    toast.success('Gỡ tài khoản VLU thành công!')
                  }}
                >
                  Unlink
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
