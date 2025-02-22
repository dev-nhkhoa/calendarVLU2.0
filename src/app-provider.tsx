'use client'

import type { User } from 'next-auth'
import { useSession } from 'next-auth/react'
import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useAccountStore } from './store/use-account'
import { Account } from '@prisma/client'

interface AppContextType {
  user: User | null
  accounts: Account[]
  setUser: (user: User | null) => void
  setAccounts: (accounts: Account[]) => void
  addAccount: (account: Account, userId: string) => void
  deleteAccount: (account: Account) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const { accounts, setAccounts, addAccount, deleteAccount } = useAccountStore()

  useEffect(() => {
    async function fetchAccounts() {
      const response = await fetch(`/api/accounts?email=${session?.user?.email}`, {
        method: 'GET',
      })

      if (!response.ok) {
        console.error('Failed to fetch linked accounts')
        return
      }

      setAccounts(await response.json())
    }
    if (session) {
      setUser(session.user || null)
      fetchAccounts()
    }
  }, [session, setAccounts])

  return <AppContext.Provider value={{ user, accounts, setUser, setAccounts, addAccount, deleteAccount }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) throw new Error('useApp must be used within an AppProvider')

  return context
}
