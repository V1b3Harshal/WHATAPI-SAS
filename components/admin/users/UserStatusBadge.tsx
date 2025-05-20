import { Badge } from "@/components/ui/badge"

interface UserStatusBadgeProps {
  userId: string
  onlineSessions: Record<string, string>
  banned: boolean
}

export function UserStatusBadge({ userId, onlineSessions, banned }: UserStatusBadgeProps) {
  const isOnline = onlineSessions[userId] && 
    Date.now() - new Date(onlineSessions[userId]).getTime() < 5 * 60 * 1000

  if (banned) {
    return (
      <Badge variant="destructive">
        Banned
      </Badge>
    )
  }

  return isOnline ? (
    <Badge variant="outline" className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500">
      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500 inline-block"></span>
      Online
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-secondary text-muted-foreground">
      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-muted-foreground inline-block"></span>
      Offline
    </Badge>
  )
}