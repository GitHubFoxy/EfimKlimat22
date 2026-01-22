'use client'

import Image from 'next/image'
import React, { useCallback, useRef, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import type { Id } from '@/convex/_generated/dataModel'

type ImageItem = {
  url: string
  storageId?: Id<'_storage'>
}

export type ImageFieldProps = {
  label?: string // default: "Изображения"
  itemName: string
  images: ImageItem[]
  max?: number // default: 15
  onDropFilesAction?: (files: File[]) => void // caller uploads & sets new images
  onChangeAction?: (next: ImageItem[]) => void // emitted on reorder/remove
}

// Simple drop area using native input for selecting images; callers can also wire react-dropzone.
export default function ImageField({
  label = 'Изображения',
  itemName,
  images,
  max = 15,
  onDropFilesAction,
  onChangeAction,
}: ImageFieldProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const canAddMore = images.length < max
  const message = !canAddMore
    ? 'Максимум 15 изображений'
    : 'Перетащите изображения сюда или нажмите, чтобы выбрать'

  const onSelectFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : []
      if (!files.length) return
      if (!canAddMore) return // enforce max
      const allowed = files.filter((f) => f.type.startsWith('image/'))
      if (allowed.length && onDropFilesAction) onDropFilesAction(allowed)
      // reset input value to allow re-selection of the same files
      if (inputRef.current) inputRef.current.value = ''
    },
    [onDropFilesAction, canAddMore],
  )

  const onDragStart = (idx: number) => setDragIndex(idx)
  const onDragOver = (e: React.DragEvent) => e.preventDefault()
  const onDrop = (idx: number) => {
    if (dragIndex === null || dragIndex === idx) return
    const next = [...images]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(idx, 0, moved)
    setDragIndex(null)
    onChangeAction?.(next)
  }

  const removeAt = (idx: number) => {
    const next = images.filter((_, i) => i !== idx)
    onChangeAction?.(next)
  }

  return (
    <div className='space-y-2'>
      <Label className='text-sm font-medium'>{label}</Label>
      {/* Empty state / selector */}
      <div className='rounded-md border border-dashed p-4 min-h-24 flex items-center justify-between gap-3 bg-muted/30'>
        <div className='text-sm text-muted-foreground'>{message}</div>
        <div className='flex items-center gap-2'>
          <input
            ref={inputRef}
            type='file'
            accept='image/*'
            multiple
            className='hidden'
            onChange={onSelectFiles}
          />
          <button
            type='button'
            className='px-3 py-1 rounded-md border bg-background text-sm'
            onClick={() => inputRef.current?.click()}
            disabled={!canAddMore}
          >
            Выбрать
          </button>
        </div>
      </div>

      {/* Thumbnails grid */}
      {images.length > 0 && (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
          {images.map((img, idx) => (
            <div
              key={(img.storageId ?? img.url) + String(idx)}
              className='group relative border rounded-md overflow-hidden bg-background'
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(idx)}
            >
              {/* Small preview thumbnail */}
              <Image
                src={img.url}
                alt={itemName}
                width={200}
                height={96}
                className='h-24 w-full object-cover cursor-pointer'
                onClick={() => setPreview(img.url)}
                unoptimized
              />

              {/* Controls */}
              <div className='absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition'>
                <button
                  type='button'
                  className='px-2 py-1 text-xs rounded bg-black/70 text-white'
                  onClick={() => removeAt(idx)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal preview */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className='max-w-3xl'>
          {preview && (
            <Image
              src={preview}
              alt={itemName}
              width={800}
              height={600}
              className='w-full h-auto'
              unoptimized
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
