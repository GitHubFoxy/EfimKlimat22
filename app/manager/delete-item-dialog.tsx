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

interface DeleteItemDialogProps {
  isOpen: boolean
  onClose: () => void
  itemId: Id<'items'> | null
  itemName: string
}

export function DeleteItemDialog({
  isOpen,
  onClose,
  itemId,
  itemName,
}: DeleteItemDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const deleteItem = useMutation(api.manager.delete_item)

  const handleDelete = async () => {
    if (!itemId) return

    setIsLoading(true)
    try {
      await deleteItem({ id: itemId })
      toast.success('Item archived successfully')
      onClose()
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete item')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className='font-semibold'>{itemName}</span>? This will mark
            the item as archived and it will no longer appear in the active
            inventory.
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
            {isLoading ? 'Deleting...' : 'Delete Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
