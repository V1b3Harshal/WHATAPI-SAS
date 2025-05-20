import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface UsersFilterCardProps {
  isOpen: boolean
  filters: {
    status: string
    verification: string
    onboarding: string
    ban: string
  }
  onFilterChange: (filters: Partial<typeof filters>) => void
  onApply: () => void
  onReset: () => void
}

export function UsersFilterCard({ isOpen, filters, onFilterChange, onApply, onReset }: UsersFilterCardProps) {
  if (!isOpen) return null

  return (
    <Card className="p-4 mb-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange({ status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Verification</label>
          <Select
            value={filters.verification}
            onValueChange={(value) => onFilterChange({ verification: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verification</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Onboarding</label>
          <Select
            value={filters.onboarding}
            onValueChange={(value) => onFilterChange({ onboarding: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Onboarding" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Onboarding</SelectItem>
              <SelectItem value="onboarded">Onboarded</SelectItem>
              <SelectItem value="not-onboarded">Not Onboarded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ban Status</label>
          <Select
            value={filters.ban}
            onValueChange={(value) => onFilterChange({ ban: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ban Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
              <SelectItem value="not-banned">Not Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onReset}>
          Reset
        </Button>
        <Button onClick={onApply}>Apply Filters</Button>
      </div>
    </Card>
  )
}