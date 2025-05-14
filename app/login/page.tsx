"use client"

import type React from "react"
import NextImage from "next/image"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, ArrowRight, Mail, Lock, Sparkles, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showResendVerification, setShowResendVerification] = useState(false)
  const [magicLinkMessage, setMagicLinkMessage] = useState("")
  const [activeTab, setActiveTab] = useState("password")
  const [timer, setTimer] = useState(900)
  const [timerActive, setTimerActive] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const checkSession = () => {
      if (document.cookie.includes("session=")) {
        router.replace("/dashboard")
      }
      setSessionChecked(true)
    }

    if (!sessionChecked) {
      timeoutId = setTimeout(checkSession, 100)
    }

    return () => {
      clearTimeout(timeoutId)
      setSessionChecked(false)
    }
  }, [router, sessionChecked])

  useEffect(() => {
    let intervalId: NodeJS.Timeout
    if (timerActive && timer > 0) {
      intervalId = setInterval(() => setTimer((prev) => prev - 1), 1000)
    }
    return () => clearInterval(intervalId)
  }, [timerActive, timer])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const endpoint = activeTab === "magic" ? "/api/auth/magiclink" : "/api/auth/login"
      const body = activeTab === "magic" ? { email: formData.email } : formData

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        if (
          data.message &&
          typeof data.message === "string" &&
          data.message.toLowerCase().includes("not verified")
        ) {
          setShowResendVerification(true)
        }
        throw new Error(data.message || "Authentication failed")
      }

      if (activeTab === "magic") {
        setMagicLinkMessage("Magic link sent! Check your email")
        setTimerActive(true)
        setTimer(900)
      } else {
        window.location.href = data.onboarded ? "/dashboard" : "/onboarding"
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Authentication failed")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setResendLoading(true)
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to resend verification email")
      }
    } finally {
      setResendLoading(false)
    }
  }

  const handleResendMagicLink = async () => {
    try {
      const response = await fetch("/api/auth/magiclink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setMagicLinkMessage("New magic link sent!")
      setTimer(900)
      setTimerActive(true)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to resend magic link")
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    const checkMagicLinkParams = () => {
      const params = new URLSearchParams(window.location.search)
      if (params.has("error")) {
        setError(params.get("error")!)
      }
    }
    checkMagicLinkParams()
  }, [])

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        <div className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="relative overflow-hidden border border-border/50 bg-background/80 backdrop-blur-lg">
          {/* Glassmorphism effect elements */}
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-violet-600/20 blur-xl" />
          
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              <div className="flex items-center justify-center gap-2">
                <NextImage src="/logo2.svg" alt="Connect API Logo" width={40} height={40} />
                <span className="gradient-text">Welcome Back</span>
              </div>
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Sign in to your account to continue.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {magicLinkMessage && (
              <Alert className="mb-4">
                <Sparkles className="mr-2 h-4 w-4" />
                <AlertDescription>{magicLinkMessage}</AlertDescription>
              </Alert>
            )}

            <Tabs 
              defaultValue="password" 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="magic">
                  Email
                  <Badge variant="secondary" className="ml-2 text-xs">
                    No Password
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="password" className="mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link 
                        href="/forgot-password" 
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="magic" className="mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="magic-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Link...
                      </>
                    ) : (
                      <>
                        Send Magic Link
                        <Sparkles className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {timerActive && (
                    <div className="mt-2 text-center text-sm text-muted-foreground">
                      Link expires in {formatTime(timer)}
                      {timer <= 0 && (
                        <Button
                          type="button"
                          variant="link"
                          onClick={handleResendMagicLink}
                          className="ml-2 h-auto p-0 text-primary hover:text-primary/90"
                        >
                          Resend link
                        </Button>
                      )}
                    </div>
                  )}
                </form>
              </TabsContent>
            </Tabs>

            {showResendVerification && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Button
                  type="button"
                  disabled={resendLoading}
                  onClick={handleResendVerification}
                  className="mt-2 w-full"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>
                      Resend verification email
                      <RefreshCw className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative flex w-full items-center justify-center">
              <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
              <span className="relative bg-background px-2 text-sm text-muted-foreground">
                or
              </span>
            </div>
            
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="font-medium text-primary hover:text-primary/80">
                Create account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
      
      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ConnectAPI. All rights reserved.
      </div>
    </div>
  )
}