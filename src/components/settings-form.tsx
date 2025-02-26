'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import VanLangLoginForm from './van-lang-login-form'
import { useApp } from '@/app-provider'
import useLocalStorage from '@/hooks/local-storage'
import { vluAccountType } from '@/types/account'
import { toast } from 'react-toastify'

export default function SettingsForm() {
  const [vluAccount, setVluAccount] = useLocalStorage<vluAccountType | null>('vluAccount')
  const { user } = useApp()
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Mail className="h-6 w-6" />
              <span>Van Lang Account</span>
            </div>
            {vluAccount == null ? (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>Link Account</Button>
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
              <Button
                variant="outline"
                onClick={() => {
                  setVluAccount(() => null)
                  toast.success('Gỡ tài khoản VLU thành công!')
                }}
              >
                Unlink
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
