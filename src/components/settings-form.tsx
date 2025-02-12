'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'
import { useSession } from 'next-auth/react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import VanLangLoginForm from './van-lang-login-form'

export type Account = 'vanLang'

export default function SettingsForm() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [linkedAccounts, setLinkedAccounts] = useState<Account[]>([])

  useEffect(() => {
    async function fetchLinkedAccounts() {
      const response = await fetch(`/api/linked-accounts?email=${session?.user?.email}`, {
        method: 'GET',
      })

      if (!response.ok) {
        console.error('Failed to fetch linked accounts')
        return
      }

      const data = await response.json()
      const linkedProviders = Array.isArray(data) ? data.map((account) => account.provider as Account) : [data.provider as Account]
      setLinkedAccounts(linkedProviders)
    }
    fetchLinkedAccounts()
  }, [session])

  async function handleUnlinkAccount(account: Account) {
    if (account === 'vanLang') {
      const response = await fetch(`/api/unlink-account?email=${session?.user?.email}&provider=${account}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        console.error('Failed to unlink account')
        alert('Failed to unlink account')
        return
      }

      alert('Account unlinked successfully')
    }
    setLinkedAccounts(linkedAccounts.filter((a) => a !== account))
  }

  if (!session) return <div>Không tìm thấy USER!</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name: {session?.user?.name}</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email: {session?.user?.email}</Label>
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
            {linkedAccounts.includes('vanLang') ? (
              <Button variant="outline" onClick={() => handleUnlinkAccount('vanLang')}>
                Unlink
              </Button>
            ) : (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>Link Account</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Liên kết tài khoản VLU ( online.vlu.edu.vn )</DialogTitle>
                    <DialogDescription>Liên kết tài khoản VLU của bạn nhằm mục đích trích xuất lịch học, lịch thi của bạn.</DialogDescription>
                  </DialogHeader>
                  <VanLangLoginForm setOpen={setOpen} setLinkedAccounts={setLinkedAccounts} userEmail={session?.user?.email || ''} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
