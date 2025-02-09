import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { SignUpForm } from '@/components/auth/sign-up-form'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Sign Up - CalendarVLU2.0',
  description: 'Create a new account',
}

export default function SignUpPage() {
  return (
    <Suspense>
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-primary" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Link href="/" className="flex items-center">
              <Image src="/placeholder.svg?height=40&width=40" alt="Logo" width={40} height={40} className="mr-2" />
              CalendarVLU2.0
            </Link>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">&quot;Join VLUCalen and take control of your academic schedule today!&quot;</p>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
              <p className="text-sm text-muted-foreground">Enter your details below to create your account</p>
            </div>
            <SignUpForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{' '}
              <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
