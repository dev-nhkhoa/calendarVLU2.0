import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowRight, Check } from 'lucide-react'
import { Header } from '@/components/header'
import Footer from '@/components/footer'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">Sync Your VLU Calendar Effortlessly</h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Convert your Van Lang University learning schedule to Google Calendar, Outlook, and more with just a few clicks.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild>
                  <Link href="#get-started">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="#how-it-works">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">Features</h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-3 text-center">
                <Calendar className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Easy Conversion</h3>
                <p className="text-gray-500 dark:text-gray-400">Convert your VLU schedule to popular calendar formats with ease.</p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <Check className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Multiple Platforms</h3>
                <p className="text-gray-500 dark:text-gray-400">Compatible with Google Calendar, Outlook, and more.</p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <ArrowRight className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Quick Sync</h3>
                <p className="text-gray-500 dark:text-gray-400">Instantly sync your academic schedule across all your devices.</p>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">How It Works</h2>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
                <span className="text-3xl font-bold text-primary">1</span>
                <h3 className="text-xl font-bold">Upload Your Schedule</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">Upload your VLU learning calendar file to our secure platform.</p>
              </div>
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
                <span className="text-3xl font-bold text-primary">2</span>
                <h3 className="text-xl font-bold">Choose Your Format</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">Select the calendar format you want to convert to (Google, Outlook, etc.).</p>
              </div>
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
                <span className="text-3xl font-bold text-primary">3</span>
                <h3 className="text-xl font-bold">Download & Sync</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">Download the converted calendar and import it into your preferred app.</p>
              </div>
            </div>
          </div>
        </section>
        <section id="get-started" className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Sync Your Schedule?</h2>
              <p className="mx-auto max-w-[600px] text-primary-foreground/90 md:text-xl">Start converting your Van Lang University calendar today and never miss a class or deadline again.</p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/convert">Start Converting Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
