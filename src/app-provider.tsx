'use client'

import type { User } from 'next-auth'
import { useSession } from 'next-auth/react'
import { createContext, useContext, ReactNode, useState, useEffect } from 'react'

interface AppContextType {
  user: User | null
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (session?.user) {
      setUser(session?.user)
    }
  }, [session])

  return <AppContext.Provider value={{ user }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) throw new Error('useApp must be used within an AppProvider')

  return context
}
