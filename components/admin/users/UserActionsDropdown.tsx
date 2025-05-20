import { User } from "@/types/admin"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Ban, CheckCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface UserActionsDropdownProps {
  user: User
  onViewDetails: () => void
  onBan: () => void
  onUnban: () => void
}

export function UserActionsDropdown({ user, onViewDetails, onBan, onUnban }: UserActionsDropdownProps) {
  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onViewDetails}>
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View Details</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onViewDetails}>
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
        {user.banned ? (
          <DropdownMenuItem
            onClick={onUnban}
            className="text-green-600 dark:text-green-400"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Unban User
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={onBan}
            className="text-destructive"
          >
            <Ban className="w-4 h-4 mr-2" />
            Ban User
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}