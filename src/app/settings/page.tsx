import type { Metadata } from 'next'
import SettingsForm from '@/components/settings-form'

export const metadata: Metadata = {
  title: 'User Settings',
  description: 'Manage your account settings and connected accounts',
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">User Settings</h1>
      <div className="max-w-2xl mx-auto">
        <SettingsForm />
      </div>
    </div>
  )
}
