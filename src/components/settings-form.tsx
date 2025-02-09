'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChromeIcon as Google, Mail, ComputerIcon as Microsoft } from 'lucide-react'

type Account = 'google' | 'vanLang' | 'microsoft'

export default function SettingsForm() {
  const [name, setName] = useState('John Doe')
  const [email, setEmail] = useState('john.doe@example.com')
  const [studentId, setStudentId] = useState('123456')
  const [linkedAccounts, setLinkedAccounts] = useState<Account[]>(['vanLang'])

  const handleLinkAccount = (account: Account) => {
    if (!linkedAccounts.includes(account)) {
      // TODO: Implement actual account linking logic
      setLinkedAccounts([...linkedAccounts, account])
    }
  }

  const handleUnlinkAccount = (account: Account) => {
    // TODO: Implement actual account unlinking logic
    setLinkedAccounts(linkedAccounts.filter((a) => a !== account))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input id="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
          </div>
          <Button>Save Changes</Button>
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
              <Google className="h-6 w-6" />
              <span>Google Account</span>
            </div>
            {linkedAccounts.includes('google') ? (
              <Button variant="outline" onClick={() => handleUnlinkAccount('google')}>
                Unlink
              </Button>
            ) : (
              <Button onClick={() => handleLinkAccount('google')}>Link Account</Button>
            )}
          </div>
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
              <Button onClick={() => handleLinkAccount('vanLang')}>Link Account</Button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Microsoft className="h-6 w-6" />
              <span>Microsoft Account</span>
            </div>
            {linkedAccounts.includes('microsoft') ? (
              <Button variant="outline" onClick={() => handleUnlinkAccount('microsoft')}>
                Unlink
              </Button>
            ) : (
              <Button onClick={() => handleLinkAccount('microsoft')}>Link Account</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
