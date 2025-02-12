'use client'

import Link from 'next/link'
import { Calendar, Home, RefreshCw, LogOutIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from './ui/button'
import React from 'react'
import { signOut, useSession } from 'next-auth/react'

export default function HeaderPage() {
  const { data: session } = useSession()
  const isLoggedIn = !!session

  return (
    <header className="px-4 sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex h-14 items-center justify-center w-full">
        <Link className="flex items-center justify-center mr-6" href="/">
          <Calendar className="h-6 w-6 mr-2" />
          <span className="font-bold hidden sm:inline-block">CalendarVLU2.0</span>
        </Link>
        <nav className="flex justify-end space-x-4 lg:space-x-6 mx-auto w-full">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary flex items-center">
            <Home className="h-4 w-4 lg:hidden" />
            <span className="hidden lg:inline-block">Home</span>
          </Link>
          <Link href="/convert" className="text-sm font-medium transition-colors hover:text-primary flex items-center">
            <RefreshCw className="h-4 w-4 lg:hidden" />
            <span className="hidden lg:inline-block">Convert</span>
          </Link>
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Thông tin tài khoản</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/settings" className="text-sm font-medium transition-colors hover:text-primary flex items-center">
                    <span className="lg:inline-block">Cài đặt</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={() => signOut({ redirectTo: '/' })}>
                  <LogOutIcon /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-4">
              <Button asChild variant="outline">
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
