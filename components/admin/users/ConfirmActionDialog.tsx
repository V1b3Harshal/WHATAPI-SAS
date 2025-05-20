import { User } from "@/types/admin"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Ban, CheckCircle } from "lucide-react"
import { UserAvatar } from "./UserAvatar"

interface ConfirmActionDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  actionType: "ban" | "unban" | null
  onConfirm: () => void
}

export function ConfirmActionDialog({ isOpen, onOpenChange, user, actionType, onConfirm }: ConfirmActionDialogProps) {
  if (!user || !actionType) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{actionType === "ban" ? "Ban User" : "Unban User"}</DialogTitle>
          <DialogDescription>
            {actionType === "ban"
              ? "Are you sure you want to ban this user? They will no longer be able to access the platform."
              : "Are you sure you want to unban this user? This will restore their access to the platform."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-3 p-3 rounded-md bg-muted">
            <UserAvatar user={user} />
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={actionType === "ban" ? "destructive" : "default"}
            className={actionType === "unban" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
            onClick={onConfirm}
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
  )
}