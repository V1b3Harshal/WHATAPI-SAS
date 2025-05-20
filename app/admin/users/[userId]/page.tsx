"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  UserIcon,
  Mail,
  Shield,
  CreditCard,
  Zap,
  Wallet,
  Activity,
  Info,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface User {
  _id: string
  id: string
  name: string
  email: string
  emailVerified?: Date
  onboarded: boolean
  banned: boolean
  createdAt: string
  lastSeen?: string
}

interface OnlineSessions {
  [userId: string]: string // lastActivity as ISO string
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [user, setUser] = useState<User | null>(null)
  const [onlineSessions, setOnlineSessions] = useState<OnlineSessions>({})
  const [loading, setLoading] = useState(true)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"ban" | "unban" | null>(null)

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      if (!res.ok) {
        throw new Error("Failed to fetch user")
      }
      const data = await res.json()
      setUser(data)
    } catch (error) {
      console.error("Error fetching user details:", error)
      toast({
        title: "Error",
        description: "Failed to fetch user details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch online session data
  const fetchOnlineSessions = async () => {
    try {
      const res = await fetch("/api/admin/online-sessions")
      const data = await res.json()
      setOnlineSessions(data.onlineSessions)
    } catch (error) {
      console.error("Error fetching online sessions:", error)
    }
  }

  // Ban a user
  const banUser = async () => {
    try {
      const res = await fetch(`/api/admin/ban-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        throw new Error("Failed to ban user")
      }

      // Update local state
      setUser((user) => (user ? { ...user, banned: true } : null))

      toast({
        title: "Success",
        description: "User has been banned successfully.",
      })
    } catch (error) {
      console.error("Error banning user:", error)
      toast({
        title: "Error",
        description: "Failed to ban user. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Unban a user
  const unbanUser = async () => {
    try {
      const res = await fetch(`/api/admin/unban-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        throw new Error("Failed to unban user")
      }

      // Update local state
      setUser((user) => (user ? { ...user, banned: false } : null))

      toast({
        title: "Success",
        description: "User has been unbanned successfully.",
      })
    } catch (error) {
      console.error("Error unbanning user:", error)
      toast({
        title: "Error",
        description: "Failed to unban user. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle user action confirmation
  const handleConfirmAction = () => {
    if (!actionType) return

    if (actionType === "ban") {
      banUser()
    } else if (actionType === "unban") {
      unbanUser()
    }

    setIsConfirmDialogOpen(false)
    setActionType(null)
  }

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Check if user is online
  const isUserOnline = (userId: string) => {
    const sessionLastSeen = onlineSessions[userId]
    return sessionLastSeen && Date.now() - new Date(sessionLastSeen).getTime() < 5 * 60 * 1000
  }

  useEffect(() => {
    fetchUserDetails()
    fetchOnlineSessions()

    // Poll for online status updates
    const intervalId = setInterval(fetchOnlineSessions, 30000)
    return () => clearInterval(intervalId)
  }, [userId])

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-6 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Users
      </Button>

      {loading ? (
        <div className="space-y-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>

          <div className="grid gap-8">
            <Skeleton className="h-10 w-full" />
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      ) : user ? (
        <>
          <div className="grid gap-8">
            <Card className="overflow-hidden border-none shadow-lg">
              <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 h-32"></div>
              <CardContent className="relative px-6 pb-6 -mt-16">
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-slate-700 to-slate-900 text-white">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    {user.banned && (
                      <div className="absolute -top-2 -right-2 bg-destructive rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                        <Ban className="w-5 h-5 text-destructive-foreground" />
                      </div>
                    )}
                    {isUserOnline(user._id) && (
                      <div className="absolute bottom-1 right-1 bg-green-500 rounded-full w-6 h-6 border-4 border-background"></div>
                    )}
                  </div>

                  <div className="space-y-3 flex-1">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl font-bold">{user.name}</h1>
                        {user.banned && (
                          <Badge variant="destructive" className="font-medium text-xs">
                            <Ban className="w-3 h-3 mr-1" /> Banned
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {isUserOnline(user._id) ? (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500"
                        >
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                          Online
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-200 dark:bg-slate-800 text-muted-foreground">
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 inline-block"></span>
                          Offline
                        </Badge>
                      )}

                      {user.emailVerified ? (
                        <Badge
                          variant="outline"
                          className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500"
                        >
                          <CheckCircle className="w-3 h-3 mr-1.5" /> Verified
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500"
                        >
                          <AlertCircle className="w-3 h-3 mr-1.5" /> Unverified
                        </Badge>
                      )}

                      {user.onboarded ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500"
                        >
                          <CheckCircle className="w-3 h-3 mr-1.5" /> Onboarded
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500"
                        >
                          <AlertCircle className="w-3 h-3 mr-1.5" /> Not Onboarded
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="md:ml-auto mt-4 md:mt-0">
                    {user.banned ? (
                      <Button
                        variant="default"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => {
                          setActionType("unban")
                          setIsConfirmDialogOpen(true)
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Unban User
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setActionType("ban")
                          setIsConfirmDialogOpen(true)
                        }}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Ban User
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8">
                <TabsTrigger value="overview" className="rounded-full">
                  <Info className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="activity" className="rounded-full">
                  <Activity className="w-4 h-4 mr-2" />
                  Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8 mt-0">
                <div className="grid gap-8 md:grid-cols-2">
                  <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
                      <CardTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-slate-500" />
                        User Information
                      </CardTitle>
                      <CardDescription>Basic information about the user</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid gap-5">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                          <UserIcon className="h-5 w-5 text-slate-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Full Name</p>
                            <p className="text-sm text-muted-foreground">{user.name}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                          <Mail className="h-5 w-5 text-slate-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                          <Calendar className="h-5 w-5 text-slate-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Created At</p>
                            <p className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                          <Clock className="h-5 w-5 text-slate-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Last Seen</p>
                            <p className="text-sm text-muted-foreground">
                              {user.lastSeen ? new Date(user.lastSeen).toLocaleString() : "Never"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-2" />

                      <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4">
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-slate-500" />
                          User ID
                        </h3>
                        <div className="rounded-md bg-slate-100 dark:bg-slate-800 p-3">
                          <code className="text-xs break-all">{user.id || user._id}</code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-slate-500" />
                        Subscription & Credits
                      </CardTitle>
                      <CardDescription>User's subscription and usage information</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-5">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-slate-500" />
                            <p className="text-sm font-medium">Subscription Plan</p>
                          </div>
                          <Badge className="bg-gradient-to-r from-slate-700 to-slate-900">Free</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                          <div className="flex items-center gap-3">
                            <Zap className="h-5 w-5 text-slate-500" />
                            <p className="text-sm font-medium">Credits Remaining</p>
                          </div>
                          <p className="text-sm font-medium">100</p>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                          <div className="flex items-center gap-3">
                            <Wallet className="h-5 w-5 text-slate-500" />
                            <p className="text-sm font-medium">Total Spent</p>
                          </div>
                          <p className="text-sm font-medium">$0.00</p>
                        </div>

                        <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-4 mt-4">
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Info className="h-4 w-4" />
                            <p>Subscription and credit information will be displayed here when available.</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-slate-500" />
                      Account Status
                    </CardTitle>
                    <CardDescription>Current status and account information</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center text-center gap-2 py-2">
                            <div
                              className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                user.onboarded
                                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                              }`}
                            >
                              {user.onboarded ? (
                                <CheckCircle className="h-6 w-6" />
                              ) : (
                                <AlertCircle className="h-6 w-6" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">Onboarding</p>
                              <p className="text-sm text-muted-foreground">
                                {user.onboarded ? "Completed" : "Not Completed"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center text-center gap-2 py-2">
                            <div
                              className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                user.emailVerified
                                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                              }`}
                            >
                              {user.emailVerified ? (
                                <CheckCircle className="h-6 w-6" />
                              ) : (
                                <AlertCircle className="h-6 w-6" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">Email</p>
                              <p className="text-sm text-muted-foreground">
                                {user.emailVerified ? "Verified" : "Not Verified"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center text-center gap-2 py-2">
                            <div
                              className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                isUserOnline(user._id)
                                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {isUserOnline(user._id) ? (
                                <div className="relative">
                                  <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-50"></div>
                                  <div className="relative h-3 w-3 rounded-full bg-green-500"></div>
                                </div>
                              ) : (
                                <div className="h-3 w-3 rounded-full bg-slate-400"></div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">Status</p>
                              <p className="text-sm text-muted-foreground">
                                {isUserOnline(user._id) ? "Online" : "Offline"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center text-center gap-2 py-2">
                            <div
                              className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                user.banned
                                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                              }`}
                            >
                              {user.banned ? <Ban className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
                            </div>
                            <div>
                              <p className="font-medium">Account</p>
                              <p className="text-sm text-muted-foreground">{user.banned ? "Banned" : "Active"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-8 mt-0">
                <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-slate-500" />
                      User Activity
                    </CardTitle>
                    <CardDescription>Recent activity and login history</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Login History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <p className="text-sm">Last login</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {user.lastSeen ? new Date(user.lastSeen).toLocaleString() : "Never"}
                            </p>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              <p className="text-sm">Account created</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleString()}</p>
                          </div>

                          {user.emailVerified && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                <p className="text-sm">Email verified</p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(user.emailVerified).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border shadow-sm bg-slate-50 dark:bg-slate-900">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center gap-3 py-6">
                            <Activity className="h-12 w-12 text-slate-400" />
                            <div>
                              <h3 className="font-medium">Activity Analytics</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Detailed activity logs will be available in the Analytics section
                              </p>
                            </div>
                            <Button variant="outline" size="sm" className="mt-2">
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                              View Analytics
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Confirmation Dialog */}
          <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {actionType === "ban" ? (
                    <>
                      <Ban className="h-5 w-5 text-destructive" />
                      Ban User
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      Unban User
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {actionType === "ban"
                    ? "Are you sure you want to ban this user? They will no longer be able to access the platform."
                    : "Are you sure you want to unban this user? This will restore their access to the platform."}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <Avatar className="h-12 w-12 border-2 border-background">
                    <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant={actionType === "ban" ? "destructive" : "default"}
                  className={actionType === "unban" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                  onClick={handleConfirmAction}
                >
                  {actionType === "ban" ? (
                    <>
                      <Ban className="w-4 h-4 mr-2" />
                      Ban User
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Unban User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-6 mb-6">
            <AlertCircle className="h-12 w-12 text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold">User Not Found</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            The user you're looking for doesn't exist or has been deleted.
          </p>
          <Button variant="default" className="mt-6" onClick={() => router.push("/admin/users")}>
            Back to Users
          </Button>
        </div>
      )}
    </div>
  )
}
