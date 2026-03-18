'use client'

import { useMutation, useQuery } from 'convex/react'
import { Search, Settings, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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

type ItemStatus = 'active' | 'draft' | 'preorder'

type CategoryNode = {
  _id: Id<'categories'>
  name: string
  order: number
  parentId?: Id<'categories'>
}

interface ItemsFilterBarProps {
  brandId: Id<'brands'> | undefined
  categoryId: Id<'categories'> | undefined
  status: ItemStatus | undefined
  onBrandChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onStatusChange: (value: string) => void
  onClearFilters: () => void
}

export function ItemsFilterBar({
  brandId,
  categoryId,
  status,
  onBrandChange,
  onCategoryChange,
  onStatusChange,
  onClearFilters,
}: ItemsFilterBarProps) {
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [orderDrafts, setOrderDrafts] = useState<
    Record<string, { order: number }>
  >({})
  const [categorySearch, setCategorySearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const brands = useQuery(api.manager.list_brands_all)
  const catHierarchy = useQuery(api.manager.list_categories_hierarchy)
  const updateCategoryOrder = useMutation(api.manager.update_category_order)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(categorySearch.toLowerCase().trim())
    }, 200)
    return () => clearTimeout(timer)
  }, [categorySearch])

  const parents = catHierarchy?.parents || []
  const childrenMap = catHierarchy?.childrenMap || {}
  const selectedParentCategoryId = useMemo(() => {
    if (!categoryId) return undefined

    if (parents.some((parent) => parent._id === categoryId)) {
      return categoryId
    }

    return parents.find((parent) =>
      (childrenMap[parent._id.toString()] || []).some(
        (child) => child._id === categoryId,
      ),
    )?._id
  }, [categoryId, parents, childrenMap])

  const currentSubcategories = selectedParentCategoryId
    ? childrenMap[selectedParentCategoryId.toString()] || []
    : []
  const selectedSubcategoryId =
    categoryId &&
    currentSubcategories.some((subcategory) => subcategory._id === categoryId)
      ? categoryId
      : '__all__'

  // Filter parents and children based on search
  const filteredParents = useMemo(() => {
    if (!debouncedSearch) return parents
    return parents.filter((parent) => {
      const children = childrenMap[parent._id.toString()] || []
      const matchesParent = parent.name.toLowerCase().includes(debouncedSearch)
      const matchesChild = children.some((child) =>
        child.name.toLowerCase().includes(debouncedSearch),
      )
      return matchesParent || matchesChild
    })
  }, [parents, childrenMap, debouncedSearch])

  const getFilteredChildren = (parentId: string) => {
    const children = childrenMap[parentId] || []
    if (!debouncedSearch) return children
    return children.filter((child) =>
      child.name.toLowerCase().includes(debouncedSearch),
    )
  }

  const buildOrderDrafts = () => {
    const drafts: Record<string, { order: number }> = {}
    const sortedParents = [...parents].sort((a, b) => {
      const orderDiff = a.order - b.order
      if (orderDiff !== 0) return orderDiff
      return a.name.localeCompare(b.name)
    })
    sortedParents.forEach((parent) => {
      drafts[parent._id] = { order: parent.order }
      const children = childrenMap[parent._id.toString()] || []
      const sortedChildren = [...children].sort((a, b) => {
        const orderDiff = a.order - b.order
        if (orderDiff !== 0) return orderDiff
        return a.name.localeCompare(b.name)
      })
      sortedChildren.forEach((child) => {
        drafts[child._id] = { order: child.order }
      })
    })
    setOrderDrafts(drafts)
  }

  // When parent category changes, reset subcategory
  const handleParentCategoryChange = (parentId: string) => {
    if (parentId === '__all__') {
      onCategoryChange('__all__')
    } else {
      onCategoryChange(parentId)
    }
  }

  // When subcategory changes
  const handleSubcategoryChange = (subcatId: string) => {
    if (subcatId === '__all__') {
      onCategoryChange(selectedParentCategoryId ?? '__all__')
      return
    }

    onCategoryChange(subcatId)
  }

  const hasActiveFilters = brandId || categoryId || status
  const handleOpenOrderDialog = () => {
    buildOrderDrafts()
    setIsOrderDialogOpen(true)
  }

  const getDraftOrder = (category: CategoryNode) => {
    const draft = orderDrafts[category._id]
    if (!draft) return category.order
    return draft.order
  }

  const handleOrderChange = (category: CategoryNode, nextValue: number) => {
    const normalizedOrder = Math.trunc(nextValue)
    const siblings = category.parentId
      ? childrenMap[category.parentId.toString()] || []
      : parents

    setOrderDrafts((prev) => {
      const currentOrder = prev[category._id]?.order ?? category.order
      const nextDrafts = {
        ...prev,
        [category._id]: { order: normalizedOrder },
      }

      const siblingToSwap = siblings.find((sibling) => {
        if (sibling._id === category._id) return false
        const siblingOrder = nextDrafts[sibling._id]?.order ?? sibling.order
        return siblingOrder === normalizedOrder
      })

      if (siblingToSwap && Number.isFinite(currentOrder)) {
        nextDrafts[siblingToSwap._id] = { order: currentOrder }
      }

      return nextDrafts
    })
  }

  const handleSaveOrder = async () => {
    try {
      const updates = Object.entries(orderDrafts)
        .map(([id, draft]) => ({
          id: id as Id<'categories'>,
          order: draft.order,
        }))
        .filter((entry) => Number.isFinite(entry.order))

      await Promise.all(updates.map((entry) => updateCategoryOrder(entry)))
      toast.success('Порядок категорий обновлен')
      setIsOrderDialogOpen(false)
    } catch (error) {
      toast.error('Ошибка при обновлении порядка')
      console.error(error)
    }
  }

  const previewTree = useMemo(() => {
    const getOrderForPreview = (category: CategoryNode) => {
      const draft = orderDrafts[category._id]
      if (!draft) return category.order
      return draft.order
    }
    const sortByDraft = (a: CategoryNode, b: CategoryNode) => {
      const orderDiff = getOrderForPreview(a) - getOrderForPreview(b)
      if (orderDiff !== 0) return orderDiff
      return a.name.localeCompare(b.name)
    }

    return [...parents].sort(sortByDraft).map((parent) => {
      const children = childrenMap[parent._id.toString()] || []
      return {
        parent,
        children: [...children].sort(sortByDraft),
      }
    })
  }, [parents, childrenMap, orderDrafts])

  return (
    <div className='flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4'>
      <span className='text-sm font-medium text-gray-700'>Фильтры:</span>

      {/* Brand Filter */}
      <Select
        value={brandId ?? '__all__'}
        onValueChange={(value) => onBrandChange(value as string)}
      >
        <SelectTrigger className='w-[180px] bg-white'>
          <SelectValue placeholder='Все бренды' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='__all__'>Все бренды</SelectItem>
          {brands?.map((brand) => (
            <SelectItem key={brand._id} value={brand._id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Parent Category Filter */}
      <div className='flex items-center gap-2'>
        <Select
          value={selectedParentCategoryId ?? '__all__'}
          onValueChange={(value) => handleParentCategoryChange(value as string)}
        >
          <SelectTrigger className='w-[200px] bg-white'>
            <SelectValue placeholder='Все категории' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='__all__'>Все категории</SelectItem>
            {parents.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant='ghost'
          size='icon'
          onClick={handleOpenOrderDialog}
          title='Настройки категории'
        >
          <Settings className='w-4 h-4' />
        </Button>
      </div>

      {/* Subcategory Filter */}
      {selectedParentCategoryId && (
        <Select
          value={selectedSubcategoryId}
          onValueChange={(value) => handleSubcategoryChange(value as string)}
        >
          <SelectTrigger className='w-[200px] bg-white'>
            <SelectValue placeholder='Все подкатегории' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='__all__'>Все подкатегории</SelectItem>
            {currentSubcategories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Status Filter */}
      <Select
        value={status ?? '__all__'}
        onValueChange={(value) => onStatusChange(value as string)}
      >
        <SelectTrigger className='w-[150px] bg-white'>
          <SelectValue placeholder='Все статусы' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='__all__'>Все статусы</SelectItem>
          <SelectItem value='active'>Активный</SelectItem>
          <SelectItem value='draft'>Черновик</SelectItem>
          <SelectItem value='preorder'>Предзаказ</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant='ghost'
          size='sm'
          onClick={onClearFilters}
          className='text-gray-500 hover:text-gray-700'
        >
          <X className='w-4 h-4 mr-1' />
          Сбросить
        </Button>
      )}

      {/* Active filters count */}
      {hasActiveFilters && (
        <span className='text-xs text-gray-500 ml-auto'>
          Активных фильтров:{' '}
          {[brandId, categoryId, status].filter(Boolean).length}
        </span>
      )}

      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className='sm:max-w-xl max-h-[80vh] overflow-hidden flex flex-col'>
          <DialogHeader>
            <DialogTitle>Порядок категорий</DialogTitle>
          </DialogHeader>
          {/* Search Input */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <Input
              placeholder='Поиск категорий...'
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className='pl-10'
            />
          </div>
          <div className='flex-1 min-h-0 space-y-4 overflow-y-auto pr-1'>
            <div className='space-y-2'>
              <Label>Категории и подкатегории</Label>
              <div className='space-y-3'>
                {filteredParents.map((parent) => {
                  const children = getFilteredChildren(parent._id.toString())
                  return (
                    <div key={parent._id} className='space-y-2'>
                      <div className='flex items-center gap-3'>
                        <div className='min-w-0 flex-1 text-sm font-medium text-gray-900'>
                          {parent.name}
                        </div>
                        <Input
                          type='number'
                          className='w-24'
                          value={getDraftOrder(parent)}
                          onChange={(event) =>
                            handleOrderChange(
                              parent,
                              Number(event.target.value),
                            )
                          }
                        />
                      </div>
                      {children.length > 0 && (
                        <div className='space-y-2 pl-4'>
                          {children.map((child) => (
                            <div
                              key={child._id}
                              className='flex items-center gap-3'
                            >
                              <div className='min-w-0 flex-1 text-sm text-gray-700'>
                                {child.name}
                              </div>
                              <Input
                                type='number'
                                className='w-24'
                                value={getDraftOrder(child)}
                                onChange={(event) =>
                                  handleOrderChange(
                                    child,
                                    Number(event.target.value),
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className='space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3'>
              <div className='text-sm font-medium text-gray-900'>Превью</div>
              <div className='space-y-3 text-sm text-gray-700'>
                {previewTree.map(({ parent, children }) => (
                  <div key={parent._id} className='space-y-2'>
                    <div className='flex items-center gap-2 font-medium text-gray-900'>
                      <span className='inline-flex h-6 min-w-[2rem] items-center justify-center rounded-full bg-white text-xs font-semibold text-gray-600'>
                        {getDraftOrder(parent)}
                      </span>
                      <span className='truncate'>{parent.name}</span>
                    </div>
                    {children.length > 0 && (
                      <div className='space-y-1 pl-6'>
                        {children.map((child) => (
                          <div
                            key={child._id}
                            className='flex items-center gap-2'
                          >
                            <span className='inline-flex h-5 min-w-[2rem] items-center justify-center rounded-full bg-white text-[11px] font-medium text-gray-600'>
                              {getDraftOrder(child)}
                            </span>
                            <span className='truncate'>{child.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsOrderDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={handleSaveOrder}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
