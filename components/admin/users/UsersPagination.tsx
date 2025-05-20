import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface UsersPaginationProps {
  currentPage: number
  totalPages: number
  totalUsers: number
  usersPerPage: number
  onPageChange: (page: number) => void
}

export function UsersPagination({
  currentPage,
  totalPages,
  totalUsers,
  usersPerPage,
  onPageChange
}: UsersPaginationProps) {
  const startIndex = (currentPage - 1) * usersPerPage
  const endIndex = Math.min(startIndex + usersPerPage, totalUsers)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-muted-foreground">
        Showing {startIndex + 1} to {endIndex} of {totalUsers} users
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}