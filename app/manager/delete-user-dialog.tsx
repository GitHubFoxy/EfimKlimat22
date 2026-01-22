'use client'

import { useMutation } from 'convex/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

interface DeleteUserDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: Id<'users'> | null
  userName: string
}

export function DeleteUserDialog({
  isOpen,
  onClose,
  userId,
  userName,
}: DeleteUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const deleteUser = useMutation(api.users.delete_user)

  const handleDelete = async () => {
    if (!userId) {
      toast.error('Invalid user ID')
      return
    }

    setIsLoading(true)
    try {
      await deleteUser({ id: userId })
      toast.success('User deleted successfully')
      onClose()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to delete user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className='font-semibold'>{userName}</span>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className='mt-4'>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
