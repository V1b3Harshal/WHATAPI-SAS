"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MoreHorizontal, Ban, CheckCircle, Eye, RefreshCw, ChevronLeft, ChevronRight, Filter, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { User, OnlineSessions } from "@/types/admin"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  UsersTable,
} from "@/components/admin/users/UsersTable"
import {
  UsersTableSkeleton,
} from "@/components/admin/users/UsersTableSkeleton"
import {
  UsersFilterCard
} from "@/components/admin/users/UsersFilterCard"
import {
  UserActionsDropdown
} from "@/components/admin/users/UserActionsDropdown"

import {
  UserStatusBadge
} from "@/components/admin/users/UserStatusBadge"

import { UserAvatar } from "@/components/admin/users/UserAvatar"
import { ConfirmActionDialog } from '../../../components/admin/users/ConfirmActionDialog';
import { UsersPagination } from "@/components/admin/users/UsersPagination"

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [onlineSessions, setOnlineSessions] = useState<OnlineSessions>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"ban" | "unban" | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Filter states - initialize all to "all" to show all users by default
  const [filters, setFilters] = useState({
    status: "all" as "all" | "online" | "offline",
    verification: "all" as "all" | "verified" | "unverified",
    onboarding: "all" as "all" | "onboarded" | "not-onboarded",
    ban: "all" as "all" | "banned" | "not-banned"
  })

  const usersPerPage = 10

  // Fetch users from the API endpoint
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(data.users)
      // Initialize filteredUsers with all users
      setFilteredUsers(data.users)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setIsRefreshing(false)
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

  // Search users
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      applyFilters(users, "")
      return
    }

    try {
      const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      applyFilters(data.users, query)
    } catch (error) {
      console.error("Error searching users:", error)
      toast({
        title: "Search Error",
        description: "Failed to search users. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Apply filters to users
  const applyFilters = (userList: User[], query: string) => {
    let filtered = [...userList]

    // Apply search filter if query exists
    if (query) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()),
      )
    }

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((user) => {
        const sessionLastSeen = onlineSessions[user._id]
        const isOnline = sessionLastSeen && Date.now() - new Date(sessionLastSeen).getTime() < 5 * 60 * 1000
        return filters.status === "online" ? isOnline : !isOnline
      })
    }

    // Apply other filters
    if (filters.verification !== "all") {
      filtered = filtered.filter((user) =>
        filters.verification === "verified" ? user.emailVerified : !user.emailVerified,
      )
    }

    if (filters.onboarding !== "all") {
      filtered = filtered.filter((user) => 
        filters.onboarding === "onboarded" ? user.onboarded : !user.onboarded
      )
    }

    if (filters.ban !== "all") {
      filtered = filtered.filter((user) => 
        filters.ban === "banned" ? user.banned : !user.banned
      )
    }

    setFilteredUsers(filtered)
    setCurrentPage(1)
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  useEffect(() => {
    if (users.length > 0) {
      applyFilters(users, searchQuery)
    }
  }, [filters, onlineSessions, users, searchQuery]) // Add users and searchQuery to dependencies

  // Modify the initial data fetching useEffect
  useEffect(() => {
    let isMounted = true
    
    const fetchAll = async () => {
      try {
        const [usersRes, sessionsRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/online-sessions")
        ])
        
        if (!isMounted) return
        
        const usersData = await usersRes.json()
        const sessionsData = await sessionsRes.json()
        
        setUsers(usersData.users)
        setFilteredUsers(usersData.users) // Set initial filtered users
        setOnlineSessions(sessionsData.onlineSessions)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again.",
          variant: "destructive",
        })
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchAll()
    const intervalId = setInterval(fetchAll, 30000)
    
    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [])
  // Check if any filters are active
  const isFilterActive = Object.values(filters).some(filter => filter !== "all") || searchQuery.trim() !== ""

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setFilters({
      status: "all",
      verification: "all",
      onboarding: "all",
      ban: "all"
    })
    setIsFilterOpen(false)
  }

  // Apply filters and close filter card
  const applyAndCloseFilters = () => {
    applyFilters(users, searchQuery)
    setIsFilterOpen(false)
  }

  return (
    <div className="space-y-6">
      <UsersFilterCard 
        isOpen={isFilterOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={applyAndCloseFilters}
        onReset={resetFilters}
      />
  
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {isFilterActive && (
                <span className="flex h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
            
            {isFilterActive && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
  
        <UsersTable 
          users={filteredUsers} 
          onlineSessions={onlineSessions}
          currentPage={currentPage}
          usersPerPage={usersPerPage}
          onUserAction={(user, action) => {
            setSelectedUser(user)
            setActionType(action)
            setIsConfirmDialogOpen(true)
          }}
          onViewDetails={(userId) => router.push(`/admin/users/${userId}`)}
          isLoading={loading}
        />
  
        {!loading && filteredUsers.length > 0 && (
          <UsersPagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredUsers.length / usersPerPage)}
            totalUsers={filteredUsers.length}
            usersPerPage={usersPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <ConfirmActionDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        user={selectedUser}
        actionType={actionType}
        onConfirm={() => {
          if (!selectedUser || !actionType) return
          
          if (actionType === "ban") {
            setUsers(users.map(u => u._id === selectedUser._id ? { ...u, banned: true } : u))
            setFilteredUsers(filteredUsers.map(u => u._id === selectedUser._id ? { ...u, banned: true } : u))
          } else {
            setUsers(users.map(u => u._id === selectedUser._id ? { ...u, banned: false } : u))
            setFilteredUsers(filteredUsers.map(u => u._id === selectedUser._id ? { ...u, banned: false } : u))
          }
          
          setIsConfirmDialogOpen(false)
        }}
      />
    </div>
  )
}