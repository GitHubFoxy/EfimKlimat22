'use client'

import { useMutation, useQuery } from 'convex/react'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { cn } from '@/lib/utils'

type BrandNode = {
  _id: Id<'brands'>
  name: string
  slug: string
  country?: string
  status: 'active' | 'hidden'
}

type BrandEditorState =
  | {
      mode: 'create'
      name: string
      country: string
      status: 'active' | 'hidden'
    }
  | {
      mode: 'edit'
      id: Id<'brands'>
      name: string
      country: string
      status: 'active' | 'hidden'
    }

interface BrandManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function createDraftFromBrand(brand: BrandNode): BrandEditorState {
  return {
    mode: 'edit',
    id: brand._id,
    name: brand.name,
    country: brand.country ?? '',
    status: brand.status,
  }
}

function createNewDraft(): BrandEditorState {
  return {
    mode: 'create',
    name: '',
    country: '',
    status: 'active',
  }
}

export function BrandManagerDialog({
  open,
  onOpenChange,
}: BrandManagerDialogProps) {
  const brands = useQuery(api.manager.list_brands_all)
  const createBrand = useMutation(api.manager.create_brand)
  const updateBrand = useMutation(api.manager.update_brand)
  const deleteBrand = useMutation(api.manager.delete_brand)

  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<BrandEditorState | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const brandList = brands ?? []
  const normalizedSearch = search.trim().toLowerCase()

  const filteredBrands = useMemo(() => {
    if (!normalizedSearch) {
      return brandList
    }

    return brandList.filter((brand) =>
      `${brand.name} ${brand.country ?? ''}`
        .toLowerCase()
        .includes(normalizedSearch),
    )
  }, [brandList, normalizedSearch])

  const selectedBrand =
    editor?.mode === 'edit'
      ? (brandList.find((brand) => brand._id === editor.id) ?? null)
      : null

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearch('')
      setEditor(null)
      setIsDeleteDialogOpen(false)
      setIsSaving(false)
      setIsDeleting(false)
    }

    onOpenChange(nextOpen)
  }

  useEffect(() => {
    if (!open || editor || brandList.length === 0) {
      return
    }

    setEditor(createDraftFromBrand(brandList[0]))
  }, [brandList, editor, open])

  const handleSave = async () => {
    if (!editor) {
      return
    }

    const trimmedName = editor.name.trim()
    if (!trimmedName) {
      toast.error('Введите название бренда')
      return
    }

    setIsSaving(true)

    try {
      if (editor.mode === 'create') {
        const createdId = await createBrand({
          name: trimmedName,
          country: editor.country || null,
          status: editor.status,
        })

        toast.success('Бренд создан')
        setEditor({
          ...editor,
          mode: 'edit',
          id: createdId,
          name: trimmedName,
        })
      } else {
        await updateBrand({
          id: editor.id,
          name: trimmedName,
          country: editor.country || null,
          status: editor.status,
        })

        toast.success('Бренд обновлен')
        setEditor({
          ...editor,
          name: trimmedName,
        })
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Не удалось сохранить бренд'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editor || editor.mode !== 'edit') {
      return
    }

    const nextBrand = brandList.find((brand) => brand._id !== editor.id) ?? null

    setIsDeleting(true)

    try {
      await deleteBrand({ id: editor.id })
      toast.success('Бренд удален')
      setIsDeleteDialogOpen(false)
      setEditor(nextBrand ? createDraftFromBrand(nextBrand) : null)
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Не удалось удалить бренд'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className='flex h-[78vh] max-w-[calc(100vw-2rem)] flex-col overflow-hidden p-0 sm:max-w-4xl'>
          <div className='flex min-h-0 flex-1 flex-col'>
            <DialogHeader className='border-b px-6 py-4 pr-14'>
              <DialogTitle>Бренды</DialogTitle>
              <DialogDescription>
                Здесь можно добавлять, редактировать и удалять бренды.
              </DialogDescription>
            </DialogHeader>

            <div className='grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)]'>
              <aside className='min-h-0 overflow-hidden border-b bg-gray-50/70 lg:border-r lg:border-b-0'>
                <div className='flex h-full min-h-0 flex-col'>
                  <div className='border-b px-4 py-4'>
                    <div className='space-y-3'>
                      <Input
                        placeholder='Поиск брендов...'
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                      <Button
                        type='button'
                        variant='outline'
                        className='w-full'
                        onClick={() => setEditor(createNewDraft())}
                      >
                        <Plus className='mr-2 h-4 w-4' />
                        Добавить бренд
                      </Button>
                    </div>
                  </div>

                  <div className='min-h-0 flex-1 overflow-y-auto p-4'>
                    {filteredBrands.length === 0 ? (
                      <div className='rounded-xl border border-dashed bg-white p-6 text-sm text-gray-500'>
                        Бренды не найдены.
                      </div>
                    ) : (
                      <div className='space-y-2'>
                        {filteredBrands.map((brand) => {
                          const isSelected =
                            editor?.mode === 'edit' && editor.id === brand._id

                          return (
                            <button
                              key={brand._id}
                              type='button'
                              onClick={() =>
                                setEditor(createDraftFromBrand(brand))
                              }
                              className={cn(
                                'w-full rounded-2xl border px-4 py-3 text-left transition-colors',
                                isSelected
                                  ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                              )}
                            >
                              <div className='flex items-start justify-between gap-3'>
                                <div className='min-w-0'>
                                  <div className='truncate font-medium'>
                                    {brand.name}
                                  </div>
                                  <div
                                    className={cn(
                                      'mt-1 text-xs',
                                      isSelected
                                        ? 'text-gray-200'
                                        : 'text-gray-500',
                                    )}
                                  >
                                    {brand.country?.trim() ||
                                      'Страна не указана'}
                                  </div>
                                </div>
                                {brand.status === 'hidden' && (
                                  <span
                                    className={cn(
                                      'shrink-0 rounded-full px-2 py-1 text-[11px] font-medium',
                                      isSelected
                                        ? 'bg-white/15 text-white'
                                        : 'bg-amber-100 text-amber-700',
                                    )}
                                  >
                                    Скрыт
                                  </span>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </aside>

              <section className='min-h-0 overflow-y-auto bg-white p-6'>
                {editor ? (
                  <div className='mx-auto flex h-full max-w-xl flex-col'>
                    <div className='mb-6 flex items-start justify-between gap-4'>
                      <div>
                        <h3 className='text-xl font-semibold text-gray-900'>
                          {editor.mode === 'create'
                            ? 'Новый бренд'
                            : 'Редактирование бренда'}
                        </h3>
                        <p className='mt-1 text-sm text-gray-500'>
                          Измените название, страну и видимость бренда.
                        </p>
                      </div>
                    </div>

                    <div className='rounded-3xl border border-gray-200 bg-gray-50/70 p-5'>
                      <div className='grid gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='brand-name'>Название</Label>
                          <Input
                            id='brand-name'
                            value={editor.name}
                            onChange={(event) =>
                              setEditor((current) =>
                                current
                                  ? { ...current, name: event.target.value }
                                  : current,
                              )
                            }
                            placeholder='Например: Royal Thermo'
                          />
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='brand-country'>Страна</Label>
                          <Input
                            id='brand-country'
                            value={editor.country}
                            onChange={(event) =>
                              setEditor((current) =>
                                current
                                  ? { ...current, country: event.target.value }
                                  : current,
                              )
                            }
                            placeholder='Например: Италия'
                          />
                        </div>

                        <div className='space-y-2'>
                          <Label>Статус</Label>
                          <Select
                            value={editor.status}
                            onValueChange={(value) =>
                              setEditor((current) =>
                                current
                                  ? {
                                      ...current,
                                      status: value as 'active' | 'hidden',
                                    }
                                  : current,
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='active'>Активный</SelectItem>
                              <SelectItem value='hidden'>Скрытый</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {editor.mode === 'edit' && (
                      <div className='mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600'>
                        <div>
                          slug:{' '}
                          <span className='font-mono'>
                            {selectedBrand?.slug}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className='mt-auto pt-6'>
                      <DialogFooter className='justify-between sm:justify-between'>
                        {editor.mode === 'edit' ? (
                          <Button
                            type='button'
                            variant='destructive'
                            onClick={() => setIsDeleteDialogOpen(true)}
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Удалить
                          </Button>
                        ) : (
                          <div />
                        )}

                        <div className='flex flex-col-reverse gap-2 sm:flex-row'>
                          <Button
                            type='button'
                            variant='outline'
                            onClick={() => handleDialogOpenChange(false)}
                          >
                            Закрыть
                          </Button>
                          <Button
                            type='button'
                            onClick={handleSave}
                            disabled={isSaving}
                          >
                            {isSaving
                              ? 'Сохранение...'
                              : editor.mode === 'create'
                                ? 'Создать'
                                : 'Сохранить'}
                          </Button>
                        </div>
                      </DialogFooter>
                    </div>
                  </div>
                ) : (
                  <div className='flex h-full items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 p-8 text-center text-sm text-gray-500'>
                    Выберите бренд слева или создайте новый.
                  </div>
                )}
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Удалить бренд</DialogTitle>
            <DialogDescription>
              Удаление будет заблокировано, если к бренду привязаны товары или
              связанные группы вариантов.
            </DialogDescription>
          </DialogHeader>
          <div className='rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700'>
            {editor?.mode === 'edit' && (
              <>
                Будет удалена запись{' '}
                <span className='font-semibold'>{editor.name}</span>.
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
