'use client'

import { useQuery } from 'convex/react'
import { Settings, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { CategoryManagerDialog } from './category-manager-dialog'

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
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)
  const brands = useQuery(api.manager.list_brands_all)
  const catHierarchy = useQuery(api.manager.list_categories_hierarchy)

  const parents = catHierarchy?.parents || []
  const childrenMap = catHierarchy?.childrenMap || {}

  const selectedParentCategoryId = useMemo(() => {
    if (!categoryId) {
      return undefined
    }

    if (parents.some((parent) => parent._id === categoryId)) {
      return categoryId
    }

    return parents.find((parent) =>
      (childrenMap[parent._id.toString()] || []).some(
        (child: CategoryNode) => child._id === categoryId,
      ),
    )?._id
  }, [categoryId, parents, childrenMap])

  const currentSubcategories = selectedParentCategoryId
    ? childrenMap[selectedParentCategoryId.toString()] || []
    : []
  const selectedSubcategoryId =
    categoryId &&
    currentSubcategories.some(
      (subcategory: CategoryNode) => subcategory._id === categoryId,
    )
      ? categoryId
      : '__all__'

  const hasActiveFilters = brandId || categoryId || status

  const handleParentCategoryChange = (parentId: string) => {
    if (parentId === '__all__') {
      onCategoryChange('__all__')
      return
    }

    onCategoryChange(parentId)
  }

  const handleSubcategoryChange = (subcatId: string) => {
    if (subcatId === '__all__') {
      onCategoryChange(selectedParentCategoryId ?? '__all__')
      return
    }

    onCategoryChange(subcatId)
  }

  return (
    <>
      <div className='mb-4 flex flex-wrap items-center gap-3 rounded-lg bg-gray-50 p-4'>
        <span className='text-sm font-medium text-gray-700'>Фильтры:</span>

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

        <div className='flex items-center gap-2'>
          <Select
            value={selectedParentCategoryId ?? '__all__'}
            onValueChange={(value) =>
              handleParentCategoryChange(value as string)
            }
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
            onClick={() => setIsCategoryManagerOpen(true)}
            title='Управление категориями'
          >
            <Settings className='h-4 w-4' />
          </Button>
        </div>

        {selectedParentCategoryId && (
          <Select
            value={selectedSubcategoryId}
            onValueChange={(value) => handleSubcategoryChange(value as string)}
          >
            <SelectTrigger className='w-[220px] bg-white'>
              <SelectValue placeholder='Все подкатегории' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='__all__'>Все подкатегории</SelectItem>
              {currentSubcategories.map((cat: CategoryNode) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

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

        {hasActiveFilters && (
          <Button
            variant='ghost'
            size='sm'
            onClick={onClearFilters}
            className='text-gray-500 hover:text-gray-700'
          >
            <X className='mr-1 h-4 w-4' />
            Сбросить
          </Button>
        )}

        {hasActiveFilters && (
          <span className='ml-auto text-xs text-gray-500'>
            Активных фильтров:{' '}
            {[brandId, categoryId, status].filter(Boolean).length}
          </span>
        )}
      </div>

      <CategoryManagerDialog
        open={isCategoryManagerOpen}
        onOpenChange={setIsCategoryManagerOpen}
      />
    </>
  )
}
