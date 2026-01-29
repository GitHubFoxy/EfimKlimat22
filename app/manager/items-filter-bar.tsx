'use client'

import { useMutation, useQuery } from 'convex/react'
import { Settings, X } from 'lucide-react'
import { useState } from 'react'
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
  const [parentCategoryId, setParentCategoryId] = useState<
    Id<'categories'> | undefined
  >(undefined)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [orderValue, setOrderValue] = useState(0)
  const brands = useQuery(api.manager.list_brands_all)
  const catHierarchy = useQuery(api.manager.list_categories_hierarchy)
  const updateCategoryOrder = useMutation(api.manager.update_category_order)

  const parents = catHierarchy?.parents || []
  const childrenMap = catHierarchy?.childrenMap || {}
  const currentSubcategories = parentCategoryId
    ? childrenMap[parentCategoryId.toString()] || []
    : []
  const selectedParent = parentCategoryId
    ? parents.find((cat) => cat._id === parentCategoryId)
    : undefined

  // When parent category changes, reset subcategory
  const handleParentCategoryChange = (parentId: string) => {
    if (parentId === '__all__') {
      setParentCategoryId(undefined)
      onCategoryChange('__all__')
    } else {
      setParentCategoryId(parentId as Id<'categories'>)
      onCategoryChange('__all__')
    }
  }

  // When subcategory changes
  const handleSubcategoryChange = (subcatId: string) => {
    onCategoryChange(subcatId)
  }

  const hasActiveFilters = brandId || categoryId || status
  const canEditCategoryOrder = Boolean(parentCategoryId && selectedParent)

  const handleOpenOrderDialog = () => {
    if (!selectedParent) return
    setOrderValue(
      Number.isFinite(selectedParent.order) ? selectedParent.order : 0,
    )
    setIsOrderDialogOpen(true)
  }

  const handleSaveOrder = async () => {
    if (!selectedParent) return
    try {
      await updateCategoryOrder({
        id: selectedParent._id,
        order: Number(orderValue),
      })
      toast.success('Порядок категории обновлен')
      setIsOrderDialogOpen(false)
    } catch (error) {
      toast.error('Ошибка при обновлении порядка')
      console.error(error)
    }
  }

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
          value={parentCategoryId ?? '__all__'}
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
          disabled={!canEditCategoryOrder}
          title='Настройки категории'
        >
          <Settings className='w-4 h-4' />
        </Button>
      </div>

      {/* Subcategory Filter */}
      {parentCategoryId && (
        <Select
          value={categoryId ?? '__all__'}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Порядок категории</DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='text-sm text-gray-600'>
              {selectedParent?.name ?? 'Категория'}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='category-order'>Порядок сортировки</Label>
              <Input
                id='category-order'
                type='number'
                value={orderValue}
                onChange={(event) =>
                  setOrderValue(Math.trunc(Number(event.target.value)))
                }
              />
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
