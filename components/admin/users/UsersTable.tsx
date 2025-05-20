import { User, OnlineSessions } from "@/types/admin"
import { UserAvatar } from "./UserAvatar"
import { UserStatusBadge } from "./UserStatusBadge"
import { UserActionsDropdown } from "./UserActionsDropdown"
import { UsersTableSkeleton } from "./UsersTableSkeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface UsersTableProps {
  users: User[]
  onlineSessions: OnlineSessions
  currentPage: number
  usersPerPage: number
  onUserAction: (user: User, action: "ban" | "unban") => void
  onViewDetails: (userId: string) => void
  isLoading?: boolean
}

export function UsersTable({
  users,
  onlineSessions,
  currentPage,
  usersPerPage,
  onUserAction,
  onViewDetails,
  isLoading = false
}: UsersTableProps) {
  const startIndex = (currentPage - 1) * usersPerPage
  const paginatedUsers = users.slice(startIndex, startIndex + usersPerPage)

  if (isLoading) {
    return <UsersTableSkeleton />
  }

  if (users.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        No users found
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.map((user) => (
            <TableRow key={user._id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} />
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <UserStatusBadge 
                  userId={user._id} 
                  onlineSessions={onlineSessions} 
                  banned={user.banned}
                />
              </TableCell>
              <TableCell className="text-right">
                <UserActionsDropdown
                  user={user}
                  onViewDetails={() => onViewDetails(user._id)}
                  onBan={() => onUserAction(user, "ban")}
                  onUnban={() => onUserAction(user, "unban")}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}