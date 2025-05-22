//app\dashboard\layout.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, FileCog, Cpu, Settings, Home, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<{name: string; email: string; role: string} | null>(null)
  const [loading, setLoading] = useState(true)

  const isActive = (path: string) => {
    return pathname === path || (path !== "/dashboard" && pathname.startsWith(path))
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        router.push("/login")
      } else {
        console.error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  useEffect(() => {
    setMounted(true)
    
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        if (data.authenticated) {
          setUser({
            name: data.name,
            email: data.email,
            role: data.role
          })
        } else {
          // Redirect unauthenticated users
          router.push('/login')
        }
      } catch (error) {
        console.error("Session check failed:", error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4 mr-2" />,
    },
    {
      href: "/dashboard/templates",
      label: "Manage Templates",
      icon: <FileCog className="w-4 h-4 mr-2" />,
    },
    {
      href: "/dashboard/api",
      label: "Manage API",
      icon: <Cpu className="w-4 h-4 mr-2" />,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4 mr-2" />,
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-sm border-b">
        <div className="container-custom">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="text-xl font-bold">Dashboard</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              {mounted ? (
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              ) : (
                <Button variant="ghost" size="icon" aria-label="Toggle theme" />
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-2 p-2">
                    {user && (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    )}
                    <Link href="/">
                      <DropdownMenuItem className="cursor-pointer">
                        <Home className="w-4 h-4 mr-2" />
                        Home
                      </DropdownMenuItem>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link href="/admin">
                        <DropdownMenuItem className="cursor-pointer">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Admin Panel
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-b">
            <div className="container-custom py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-2 border-t">
                <Link
                  href="/"
                  className="flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Link>
                )}
                <button
                  className="flex items-center text-sm font-medium text-destructive hover:text-destructive transition-colors"
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 pt-16 overflow-y-auto">
        <div className="container-custom py-4 md:py-6">
          {children}
        </div>
      </main>
    </div>
  )
}