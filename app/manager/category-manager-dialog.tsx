'use client'

import { useMutation, useQuery } from 'convex/react'
import {
  ChevronDown,
  FolderPlus,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react'
import type { DragEvent } from 'react'
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
      parentId: Id<'categories'> | ''
      isVisible: boolean
    }
  | {
      mode: 'edit'
      id: Id<'categories'>
      name: string
      parentId: Id<'categories'> | ''
      isVisible: boolean
    }

type DragState = {
  draggedId: Id<'categories'>
  parentId: Id<'categories'> | null
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
  const reorderCategories = useMutation(api.manager.reorder_categories)

  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<CategoryEditorState | null>(null)
  const [collapsedParents, setCollapsedParents] = useState<
    Record<string, boolean>
  >({})
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [dragOverId, setDragOverId] = useState<Id<'categories'> | null>(null)
  const [isReordering, setIsReordering] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const parents = hierarchy?.parents ?? []
  const childrenMap = hierarchy?.childrenMap ?? {}
  const normalizedSearch = search.trim().toLowerCase()
  const isReorderEnabled = normalizedSearch.length === 0

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

  const expandParent = (parentId: Id<'categories'>) => {
    setCollapsedParents((current) => {
      if (!current[parentId.toString()]) {
        return current
      }

      const next = { ...current }
      delete next[parentId.toString()]
      return next
    })
  }

  const toggleParent = (parentId: Id<'categories'>) => {
    setCollapsedParents((current) => ({
      ...current,
      [parentId.toString()]: !current[parentId.toString()],
    }))
  }

  const handleCreateCategory = () => {
    setEditor(createNewDraft())
  }

  const handleCreateSubcategory = () => {
    const parentId = getSuggestedParentId(selectedCategory)
    if (parentId) {
      expandParent(parentId)
    }
    setEditor(createNewDraft(parentId))
  }

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearch('')
      setEditor(null)
      setCollapsedParents({})
      setDragState(null)
      setDragOverId(null)
      setIsReordering(false)
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

  useEffect(() => {
    if (!selectedCategory?.parentId) {
      return
    }

    const parentId = selectedCategory.parentId.toString()

    setCollapsedParents((current) => {
      if (!current[parentId]) {
        return current
      }

      const next = { ...current }
      delete next[parentId]
      return next
    })
  }, [selectedCategory?.parentId])

  const buildReorderedIds = (
    siblings: CategoryNode[],
    draggedId: Id<'categories'>,
    targetId: Id<'categories'>,
  ) => {
    const sourceIndex = siblings.findIndex((item) => item._id === draggedId)
    const targetIndex = siblings.findIndex((item) => item._id === targetId)

    if (
      sourceIndex === -1 ||
      targetIndex === -1 ||
      sourceIndex === targetIndex
    ) {
      return null
    }

    const next = [...siblings]
    const [movedItem] = next.splice(sourceIndex, 1)
    next.splice(targetIndex, 0, movedItem)

    return next.map((item) => item._id)
  }

  const handleDragStart = (
    event: DragEvent<HTMLDivElement>,
    draggedId: Id<'categories'>,
    parentId: Id<'categories'> | null,
  ) => {
    if (!isReorderEnabled || isReordering) {
      event.preventDefault()
      return
    }

    event.dataTransfer.effectAllowed = 'move'
    setDragState({ draggedId, parentId })
    setDragOverId(draggedId)
  }

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>,
    targetId: Id<'categories'>,
    parentId: Id<'categories'> | null,
  ) => {
    if (
      !dragState ||
      dragState.draggedId === targetId ||
      dragState.parentId !== parentId
    ) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOverId(targetId)
  }

  const handleDragEnd = () => {
    setDragState(null)
    setDragOverId(null)
  }

  const handleDrop = async (
    event: DragEvent<HTMLDivElement>,
    targetId: Id<'categories'>,
    parentId: Id<'categories'> | null,
    siblings: CategoryNode[],
  ) => {
    event.preventDefault()

    if (
      !dragState ||
      dragState.parentId !== parentId ||
      dragState.draggedId === targetId
    ) {
      setDragState(null)
      setDragOverId(null)
      return
    }

    const orderedIds = buildReorderedIds(
      siblings,
      dragState.draggedId,
      targetId,
    )

    setDragState(null)
    setDragOverId(null)

    if (!orderedIds) {
      return
    }

    setIsReordering(true)

    try {
      await reorderCategories({
        parentId,
        orderedIds,
      })
      toast.success('Порядок обновлен')
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Не удалось изменить порядок категорий'
      toast.error(message)
    } finally {
      setIsReordering(false)
    }
  }

  const handleSave = async () => {
    if (!editor) {
      return
    }

    const trimmedName = editor.name.trim()
    if (!trimmedName) {
      toast.error('Введите название категории')
      return
    }

    setIsSaving(true)

    try {
      if (editor.mode === 'create') {
        const createdId = await createCategory({
          name: trimmedName,
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
        })
      } else {
        await updateCategory({
          id: editor.id,
          name: trimmedName,
          parentId: editor.parentId || null,
          isVisible: editor.isVisible,
        })

        toast.success('Категория обновлена')
        setEditor({
          ...editor,
          name: trimmedName,
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
                      <p className='text-xs text-gray-500'>
                        {isReorderEnabled
                          ? 'Перетащите карточки, чтобы изменить порядок.'
                          : 'Во время поиска перетаскивание отключено.'}
                      </p>
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
                          const isCollapsed =
                            normalizedSearch.length > 0
                              ? false
                              : collapsedParents[parent._id.toString()] === true
                          const isSelectedParent =
                            editor?.mode === 'edit' && editor.id === parent._id
                          const isDraggingParent =
                            dragState?.draggedId === parent._id
                          const isDragOverParent =
                            dragOverId === parent._id &&
                            dragState?.draggedId !== parent._id

                          return (
                            <div key={parent._id} className='space-y-2'>
                              <div
                                draggable={isReorderEnabled && !isReordering}
                                onDragStart={(event) =>
                                  handleDragStart(event, parent._id, null)
                                }
                                onDragOver={(event) =>
                                  handleDragOver(event, parent._id, null)
                                }
                                onDrop={(event) =>
                                  handleDrop(event, parent._id, null, parents)
                                }
                                onDragEnd={handleDragEnd}
                                className={cn(
                                  'flex items-stretch gap-2 rounded-2xl border p-2 transition-colors',
                                  isDraggingParent && 'opacity-60',
                                  isDragOverParent &&
                                    'border-blue-500 ring-2 ring-blue-200',
                                  isSelectedParent
                                    ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                                )}
                              >
                                <div
                                  className={cn(
                                    'flex w-9 shrink-0 cursor-grab items-center justify-center rounded-xl',
                                    isSelectedParent
                                      ? 'text-gray-200'
                                      : 'text-gray-400',
                                    !isReorderEnabled &&
                                      'cursor-default opacity-50',
                                  )}
                                >
                                  <GripVertical className='h-4 w-4' />
                                </div>
                                <button
                                  type='button'
                                  onClick={() => selectCategory(parent)}
                                  className='min-w-0 flex-1 rounded-xl py-1 pr-2 text-left'
                                >
                                  <div className='flex items-start justify-between gap-3'>
                                    <div className='min-w-0'>
                                      <div className='truncate font-medium'>
                                        {parent.name}
                                      </div>
                                      <div
                                        className={cn(
                                          'mt-1 text-xs',
                                          isSelectedParent
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
                                      {!parent.isVisible && (
                                        <div
                                          className={cn(
                                            'text-[11px]',
                                            isSelectedParent
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
                                  <button
                                    type='button'
                                    onClick={() => toggleParent(parent._id)}
                                    className={cn(
                                      'flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-xl border transition-colors',
                                      isSelectedParent
                                        ? 'border-white/15 bg-white/10 text-white hover:bg-white/15'
                                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100',
                                    )}
                                    aria-label={
                                      isCollapsed
                                        ? `Развернуть ${parent.name}`
                                        : `Свернуть ${parent.name}`
                                    }
                                    aria-expanded={!isCollapsed}
                                  >
                                    <ChevronDown
                                      className={cn(
                                        'h-4 w-4 transition-transform',
                                        isCollapsed && '-rotate-90',
                                      )}
                                    />
                                  </button>
                                )}
                              </div>

                              {children.length > 0 && !isCollapsed && (
                                <div className='space-y-2 pl-4'>
                                  {children.map((child) => (
                                    <div
                                      key={child._id}
                                      draggable={
                                        isReorderEnabled && !isReordering
                                      }
                                      onDragStart={(event) =>
                                        handleDragStart(
                                          event,
                                          child._id,
                                          parent._id,
                                        )
                                      }
                                      onDragOver={(event) =>
                                        handleDragOver(
                                          event,
                                          child._id,
                                          parent._id,
                                        )
                                      }
                                      onDrop={(event) =>
                                        handleDrop(
                                          event,
                                          child._id,
                                          parent._id,
                                          children,
                                        )
                                      }
                                      onDragEnd={handleDragEnd}
                                      className={cn(
                                        'flex items-center gap-2 rounded-xl border px-2 py-2 transition-colors',
                                        dragState?.draggedId === child._id &&
                                          'opacity-60',
                                        dragOverId === child._id &&
                                          dragState?.draggedId !== child._id &&
                                          'border-blue-500 ring-2 ring-blue-200',
                                        editor?.mode === 'edit' &&
                                          editor.id === child._id
                                          ? 'border-blue-600 bg-blue-50'
                                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                                      )}
                                    >
                                      <div
                                        className={cn(
                                          'flex w-9 shrink-0 cursor-grab items-center justify-center rounded-lg text-gray-400',
                                          !isReorderEnabled &&
                                            'cursor-default opacity-50',
                                        )}
                                      >
                                        <GripVertical className='h-4 w-4' />
                                      </div>
                                      <button
                                        type='button'
                                        onClick={() => selectCategory(child)}
                                        className='flex-1 text-left'
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
                                          {!child.isVisible && (
                                            <div className='shrink-0 text-[11px] text-amber-600'>
                                              Скрыта
                                            </div>
                                          )}
                                        </div>
                                      </button>
                                    </div>
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
                          Измените название и видимость. Для подкатегорий можно
                          выбрать родительскую категорию.
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
