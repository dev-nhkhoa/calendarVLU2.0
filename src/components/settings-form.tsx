'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-toastify'
import Link from 'next/link'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useApp } from '@/app-provider'

export default function SettingsForm() {
  const { user } = useApp()

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
    </div>
  )
}
