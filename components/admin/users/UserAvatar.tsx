import { User } from "@/types/admin"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Ban } from "lucide-react"

interface UserAvatarProps {
  user: User
}

export function UserAvatar({ user }: UserAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="relative">
      <Avatar>
        <AvatarFallback className="bg-primary/10 text-primary">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      {user.banned && (
        <div className="absolute -top-1 -right-1 bg-destructive rounded-full w-4 h-4 flex items-center justify-center">
          <Ban className="w-3 h-3 text-destructive-foreground" />
        </div>
      )}
    </div>
  )
}