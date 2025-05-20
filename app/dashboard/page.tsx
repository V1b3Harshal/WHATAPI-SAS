'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Activity, BarChart2, Clock, Zap, LogOut, Moon, Sun } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface SessionData {
  authenticated: boolean
  userId?: string
  email?: string
  name?: string
  role?: string 
  creditsLeft?: number
  totalCreditsUsed?: number
  error?: string
}

export default function DashboardPage() {
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const router = useRouter()

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        })
        if (res.status === 401) {
          router.push('/login')
          return
        }
        const data = await res.json()
        if (!data.authenticated) {
          router.push('/login')
          return
        }
        setSession(data)
      } catch (err) {
        console.error('Session fetch error:', err)
        setError('Failed to fetch session')
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [router])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })
      if (response.ok) {
        setSession(null)
        router.push('/')
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => router.push('/login')}
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-background-dark' : 'bg-background'}`}>
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-background-dark via-background-dark to-primary/10' : 'bg-gradient-to-br from-background via-background to-primary/10'}`} />
        <div className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="container-custom py-8">
        {/* Header section with logout and theme toggle */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{session.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{session.name}</p>
              <p className="text-sm text-muted-foreground">{session.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
          {session.role === 'admin' && (
    <Button 
      variant="outline" 
      onClick={() => router.push('/admin')}
      className="gap-2"
    >
      <Activity className="h-5 w-5" />
      Admin Panel
    </Button>
  )}
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Button variant="destructive" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="border-border/50 bg-background/80 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Welcome back, {session.name}!
              </CardTitle>
              <CardDescription>
                Here's an overview of your API usage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground">{session.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Credits Left</p>
                  <p className="text-foreground font-bold">{session.creditsLeft || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* API Usage Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="heading-md mb-4 flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            API Usage Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard 
              title="Total Credits Used" 
              value={session.totalCreditsUsed?.toString() || "0"} 
              icon={<Zap className="h-5 w-5" />} 
              color="bg-primary/10 text-primary" 
            />
            <StatCard 
              title="Credits Remaining" 
              value={session.creditsLeft?.toString() || "0"} 
              icon={<Clock className="h-5 w-5" />} 
              color="bg-green-500/10 text-green-500" 
            />
            <StatCard 
              title="Last API Call" 
              value="2 hours ago" 
              icon={<Activity className="h-5 w-5" />} 
              color="bg-yellow-500/10 text-yellow-500" 
            />
          </div>
        </motion.div>

        {/* Recent API Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border-border/50 bg-background/80 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent API Activity
              </CardTitle>
              <CardDescription>
                Your latest API interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem 
                  title="API Endpoint: /v1/data" 
                  time="2 hours ago" 
                  description="Credits used: 5"
                />
                <ActivityItem 
                  title="API Endpoint: /v1/auth" 
                  time="5 hours ago" 
                  description="Credits used: 1"
                />
                <ActivityItem 
                  title="API Endpoint: /v1/profile" 
                  time="1 day ago" 
                  description="Credits used: 2"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="heading-md mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="gap-2">
              <Zap className="h-4 w-4" />
              Buy More Credits
            </Button>
            <Button variant="outline" className="gap-2">
              <Activity className="h-4 w-4" />
              View API Logs
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Reusable stat card component
function StatCard({ title, value, icon, color }: { 
  title: string
  value: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card className="border-border/50 bg-background/80 backdrop-blur-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`rounded-full p-2 ${color}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

// Reusable activity item component
function ActivityItem({ title, time, description }: { 
  title: string
  time: string
  description: string
}) {
  return (
    <div className="flex gap-4">
      <div className="relative flex flex-col items-center">
        <div className="h-3 w-3 rounded-full bg-primary mt-1" />
        <div className="w-px h-full bg-border" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-foreground">{title}</h4>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}