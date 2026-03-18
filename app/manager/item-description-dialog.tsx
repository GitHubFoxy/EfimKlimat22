'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface ItemDescriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onSave: (value: string) => void
}

export function ItemDescriptionDialog({
  open,
  onOpenChange,
  value,
  onSave,
}: ItemDescriptionDialogProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (open) {
      setDraft(value)
    }
  }, [open, value])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Описание товара</DialogTitle>
          <DialogDescription>
            Отдельное окно для длинного текста, чтобы основной редактор не
            разъезжался по высоте.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className='min-h-[50vh]'
          placeholder='Введите описание товара'
        />

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button
            type='button'
            onClick={() => {
              onSave(draft)
              onOpenChange(false)
            }}
          >
            Применить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
