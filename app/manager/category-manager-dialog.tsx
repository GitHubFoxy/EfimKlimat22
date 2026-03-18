'use client'

import { useMutation, useQuery } from 'convex/react'
import { FolderPlus, Plus, Trash2 } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { cn } from '@/lib/utils'

type CategoryNode = {
  _id: Id<'categories'>
  name: string
  slug: string
  order: number
  parentId?: Id<'categories'>
  level: number
  isVisible: boolean
}

type CategoryEditorState =
  | {
      mode: 'create'
      name: string
      order: string
      parentId: Id<'categories'> | ''
      isVisible: boolean
    }
  | {
      mode: 'edit'
      id: Id<'categories'>
      name: string
      order: string
      parentId: Id<'categories'> | ''
      isVisible: boolean
    }

interface CategoryManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function createDraftFromCategory(category: CategoryNode): CategoryEditorState {
  return {
    mode: 'edit',
    id: category._id,
    name: category.name,
    order: String(category.order),
    parentId: category.parentId ?? '',
    isVisible: category.isVisible,
  }
}

function createNewDraft(
  parentId: Id<'categories'> | '' = '',
): CategoryEditorState {
  return {
    mode: 'create',
    name: '',
    order: '0',
    parentId,
    isVisible: true,
  }
}

function getSuggestedParentId(category?: CategoryNode | null) {
  if (!category) {
    return '' as const
  }

  return category.parentId ?? category._id
}

export function CategoryManagerDialog({
  open,
  onOpenChange,
}: CategoryManagerDialogProps) {
  const hierarchy = useQuery(api.manager.list_categories_hierarchy)
  const createCategory = useMutation(api.manager.create_category)
  const updateCategory = useMutation(api.manager.update_category)
  const deleteCategory = useMutation(api.manager.delete_category)

  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<CategoryEditorState | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const parents = hierarchy?.parents ?? []
  const childrenMap = hierarchy?.childrenMap ?? {}
  const normalizedSearch = search.trim().toLowerCase()

  const categoriesById = useMemo(() => {
    const map = new Map<Id<'categories'>, CategoryNode>()

    for (const parent of parents) {
      map.set(parent._id, parent)
      const children = childrenMap[parent._id.toString()] || []
      for (const child of children) {
        map.set(child._id, child)
      }
    }

    return map
  }, [parents, childrenMap])

  const filteredParents = useMemo(() => {
    if (!normalizedSearch) {
      return parents
    }

    return parents.filter((parent) => {
      const matchesParent = parent.name.toLowerCase().includes(normalizedSearch)
      const children = childrenMap[parent._id.toString()] || []
      const matchesChild = children.some((child) =>
        child.name.toLowerCase().includes(normalizedSearch),
      )
      return matchesParent || matchesChild
    })
  }, [childrenMap, normalizedSearch, parents])

  const getFilteredChildren = (parentId: string) => {
    const children = childrenMap[parentId] || []
    if (!normalizedSearch) {
      return children
    }

    return children.filter((child) =>
      child.name.toLowerCase().includes(normalizedSearch),
    )
  }

  const selectedCategory =
    editor?.mode === 'edit' ? (categoriesById.get(editor.id) ?? null) : null
  const selectedChildCount = selectedCategory
    ? (childrenMap[selectedCategory._id.toString()] || []).length
    : 0
  const parentSelectionDisabled =
    editor?.mode === 'edit' &&
    !selectedCategory?.parentId &&
    selectedChildCount > 0

  const selectCategory = (category: CategoryNode) => {
    setEditor(createDraftFromCategory(category))
  }

  const handleCreateCategory = () => {
    setEditor(createNewDraft())
  }

  const handleCreateSubcategory = () => {
    const parentId = getSuggestedParentId(selectedCategory)
    setEditor(createNewDraft(parentId))
  }

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
    if (!open || editor || parents.length === 0) {
      return
    }

    setEditor(createDraftFromCategory(parents[0]))
  }, [editor, open, parents])

  const handleSave = async () => {
    if (!editor) {
      return
    }

    const trimmedName = editor.name.trim()
    if (!trimmedName) {
      toast.error('Введите название категории')
      return
    }

    const parsedOrder = Number(editor.order)
    if (!Number.isFinite(parsedOrder)) {
      toast.error('Порядок должен быть числом')
      return
    }

    setIsSaving(true)

    try {
      if (editor.mode === 'create') {
        const createdId = await createCategory({
          name: trimmedName,
          order: parsedOrder,
          parentId: editor.parentId || null,
          isVisible: editor.isVisible,
        })

        toast.success(
          editor.parentId ? 'Подкатегория создана' : 'Категория создана',
        )
        setEditor({
          ...editor,
          mode: 'edit',
          id: createdId,
          name: trimmedName,
          order: String(Math.trunc(parsedOrder)),
        })
      } else {
        await updateCategory({
          id: editor.id,
          name: trimmedName,
          order: parsedOrder,
          parentId: editor.parentId || null,
          isVisible: editor.isVisible,
        })

        toast.success('Категория обновлена')
        setEditor({
          ...editor,
          name: trimmedName,
          order: String(Math.trunc(parsedOrder)),
        })
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Не удалось сохранить категорию'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editor || editor.mode !== 'edit') {
      return
    }

    const nextCategory =
      parents.find((parent) => parent._id !== editor.id) ??
      parents
        .flatMap((parent) => childrenMap[parent._id.toString()] || [])
        .find((category) => category._id !== editor.id) ??
      null

    setIsDeleting(true)

    try {
      await deleteCategory({ id: editor.id })
      toast.success(
        editor.parentId ? 'Подкатегория удалена' : 'Категория удалена',
      )
      setIsDeleteDialogOpen(false)
      setEditor(nextCategory ? createDraftFromCategory(nextCategory) : null)
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Не удалось удалить категорию'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className='flex h-[85vh] max-w-[calc(100vw-2rem)] flex-col overflow-hidden p-0 sm:max-w-6xl'>
          <div className='flex min-h-0 flex-1 flex-col'>
            <DialogHeader className='border-b px-6 py-4 pr-14'>
              <DialogTitle>Категории</DialogTitle>
              <DialogDescription>
                Здесь можно редактировать категории и подкатегории, менять их
                порядок, создавать новые записи и безопасно удалять ненужные.
              </DialogDescription>
            </DialogHeader>

            <div className='grid min-h-0 flex-1 overflow-hidden gap-0 lg:grid-cols-[340px_minmax(0,1fr)]'>
              <aside className='min-h-0 overflow-hidden border-b bg-gray-50/70 lg:border-r lg:border-b-0'>
                <div className='flex h-full min-h-0 flex-col'>
                  <div className='border-b px-4 py-4'>
                    <div className='space-y-3'>
                      <Input
                        placeholder='Поиск категорий...'
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                      <div className='flex gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          className='flex-1'
                          onClick={handleCreateCategory}
                        >
                          <Plus className='mr-2 h-4 w-4' />
                          Категория
                        </Button>
                        <Button
                          type='button'
                          variant='outline'
                          className='flex-1'
                          onClick={handleCreateSubcategory}
                          disabled={parents.length === 0}
                        >
                          <FolderPlus className='mr-2 h-4 w-4' />
                          Подкатегория
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain p-4'>
                    {filteredParents.length === 0 ? (
                      <div className='rounded-xl border border-dashed bg-white p-6 text-sm text-gray-500'>
                        Категории не найдены.
                      </div>
                    ) : (
                      <div className='space-y-4'>
                        {filteredParents.map((parent) => {
                          const children = getFilteredChildren(
                            parent._id.toString(),
                          )

                          return (
                            <div key={parent._id} className='space-y-2'>
                              <button
                                type='button'
                                onClick={() => selectCategory(parent)}
                                className={cn(
                                  'w-full rounded-2xl border bg-white px-4 py-3 text-left transition-colors',
                                  editor?.mode === 'edit' &&
                                    editor.id === parent._id
                                    ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                                )}
                              >
                                <div className='flex items-start justify-between gap-3'>
                                  <div className='min-w-0'>
                                    <div className='truncate font-medium'>
                                      {parent.name}
                                    </div>
                                    <div
                                      className={cn(
                                        'mt-1 text-xs',
                                        editor?.mode === 'edit' &&
                                          editor.id === parent._id
                                          ? 'text-gray-200'
                                          : 'text-gray-500',
                                      )}
                                    >
                                      Категория · {children.length}{' '}
                                      {children.length === 1
                                        ? 'подкатегория'
                                        : children.length >= 2 &&
                                            children.length <= 4
                                          ? 'подкатегории'
                                          : 'подкатегорий'}
                                    </div>
                                  </div>
                                  <div className='shrink-0 space-y-1 text-right'>
                                    <span
                                      className={cn(
                                        'inline-flex min-w-[2.5rem] items-center justify-center rounded-full px-2 py-1 text-xs font-semibold',
                                        editor?.mode === 'edit' &&
                                          editor.id === parent._id
                                          ? 'bg-white/15 text-white'
                                          : 'bg-gray-100 text-gray-700',
                                      )}
                                    >
                                      {parent.order}
                                    </span>
                                    {!parent.isVisible && (
                                      <div
                                        className={cn(
                                          'text-[11px]',
                                          editor?.mode === 'edit' &&
                                            editor.id === parent._id
                                            ? 'text-gray-200'
                                            : 'text-amber-600',
                                        )}
                                      >
                                        Скрыта
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>

                              {children.length > 0 && (
                                <div className='space-y-2 pl-4'>
                                  {children.map((child) => (
                                    <button
                                      key={child._id}
                                      type='button'
                                      onClick={() => selectCategory(child)}
                                      className={cn(
                                        'w-full rounded-xl border px-3 py-2 text-left transition-colors',
                                        editor?.mode === 'edit' &&
                                          editor.id === child._id
                                          ? 'border-blue-600 bg-blue-50'
                                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                                      )}
                                    >
                                      <div className='flex items-center justify-between gap-3'>
                                        <div className='min-w-0'>
                                          <div className='truncate text-sm font-medium text-gray-900'>
                                            {child.name}
                                          </div>
                                          <div className='mt-1 text-xs text-gray-500'>
                                            Подкатегория
                                          </div>
                                        </div>
                                        <div className='shrink-0 text-right'>
                                          <span className='inline-flex min-w-[2rem] items-center justify-center rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-700'>
                                            {child.order}
                                          </span>
                                          {!child.isVisible && (
                                            <div className='mt-1 text-[11px] text-amber-600'>
                                              Скрыта
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </aside>

              <section className='min-h-0 overflow-y-auto overscroll-contain bg-white p-6'>
                {editor ? (
                  <div className='mx-auto flex h-full max-w-2xl flex-col'>
                    <div className='mb-6 flex items-start justify-between gap-4'>
                      <div>
                        <h3 className='text-xl font-semibold text-gray-900'>
                          {editor.mode === 'create'
                            ? editor.parentId
                              ? 'Новая подкатегория'
                              : 'Новая категория'
                            : editor.parentId
                              ? 'Редактирование подкатегории'
                              : 'Редактирование категории'}
                        </h3>
                        <p className='mt-1 text-sm text-gray-500'>
                          Измените название, порядок и видимость. Для
                          подкатегорий можно выбрать родительскую категорию.
                        </p>
                      </div>
                      <span className='rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600'>
                        {editor.parentId ? 'Подкатегория' : 'Категория'}
                      </span>
                    </div>

                    <div className='rounded-3xl border border-gray-200 bg-gray-50/70 p-5'>
                      <div className='grid gap-4 md:grid-cols-2'>
                        <div className='space-y-2 md:col-span-2'>
                          <Label htmlFor='category-name'>Название</Label>
                          <Input
                            id='category-name'
                            value={editor.name}
                            onChange={(event) =>
                              setEditor((current) =>
                                current
                                  ? { ...current, name: event.target.value }
                                  : current,
                              )
                            }
                            placeholder='Например: Газовые настенные'
                          />
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='category-order'>Порядок</Label>
                          <Input
                            id='category-order'
                            type='number'
                            value={editor.order}
                            onChange={(event) =>
                              setEditor((current) =>
                                current
                                  ? { ...current, order: event.target.value }
                                  : current,
                              )
                            }
                            placeholder='0'
                          />
                        </div>

                        <div className='space-y-2'>
                          <Label>Родительская категория</Label>
                          <Select
                            value={editor.parentId || '__root__'}
                            onValueChange={(value) =>
                              setEditor((current) =>
                                current
                                  ? {
                                      ...current,
                                      parentId:
                                        value === '__root__'
                                          ? ''
                                          : (value as Id<'categories'>),
                                    }
                                  : current,
                              )
                            }
                            disabled={Boolean(parentSelectionDisabled)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Без родителя' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='__root__'>
                                Без родителя
                              </SelectItem>
                              {parents
                                .filter((parent) =>
                                  editor.mode === 'edit'
                                    ? parent._id !== editor.id
                                    : true,
                                )
                                .map((parent) => (
                                  <SelectItem
                                    key={parent._id}
                                    value={parent._id}
                                  >
                                    {parent.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          {parentSelectionDisabled && (
                            <p className='text-xs text-amber-600'>
                              Категорию с подкатегориями нельзя превратить в
                              подкатегорию. Сначала перенесите или удалите
                              вложенные записи.
                            </p>
                          )}
                        </div>

                        <div className='md:col-span-2 flex items-center justify-between rounded-2xl border bg-white px-4 py-3'>
                          <div>
                            <div className='font-medium text-gray-900'>
                              Видимость в каталоге
                            </div>
                            <div className='text-sm text-gray-500'>
                              Скрытые категории не показываются в каталоге
                              пользователям.
                            </div>
                          </div>
                          <Switch
                            checked={editor.isVisible}
                            onCheckedChange={(checked) =>
                              setEditor((current) =>
                                current
                                  ? { ...current, isVisible: checked }
                                  : current,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {editor.mode === 'edit' && (
                      <div className='mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600'>
                        <div>
                          slug:{' '}
                          <span className='font-mono'>
                            {selectedCategory?.slug}
                          </span>
                        </div>
                        <div className='mt-1'>
                          Уровень:{' '}
                          {selectedCategory?.level === 0
                            ? 'категория'
                            : 'подкатегория'}
                        </div>
                        {selectedCategory?.level === 0 && (
                          <div className='mt-1'>
                            Подкатегорий: {selectedChildCount}
                          </div>
                        )}
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
                    Выберите категорию слева или создайте новую.
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
            <DialogTitle>Удалить категорию</DialogTitle>
            <DialogDescription>
              Удаление будет заблокировано, если у категории есть подкатегории,
              привязанные товары или связанные группы вариантов.
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
