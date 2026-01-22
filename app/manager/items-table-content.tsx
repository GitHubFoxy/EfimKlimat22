'use client'

import { Preloaded, usePreloadedQuery, useQuery } from 'convex/react'
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
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
import { getItemColumns, type Item } from './columns'
import { DataTable } from './data-table'
import { ItemsFilterBar } from './items-filter-bar'

type SortBy = 'name' | 'price' | 'quantity' | 'ordersCount' | 'createdAt'
type SortOrder = 'asc' | 'desc'
type ItemStatus = 'active' | 'draft' | 'preorder'

interface ItemsTableContentProps {
  itemsPreload: Preloaded<typeof api.manager.list_items>
  searchQuery?: string
  onEditItem?: (item: any) => void
  onDeleteItem?: (id: any, name: string) => void
}

export function ItemsTableContent({
  itemsPreload,
  searchQuery = '',
  onEditItem,
  onDeleteItem,
}: ItemsTableContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize from URL params
  const [cursor, setCursor] = useState<string | null>(
    (searchParams.get('cursor') as string) ?? null,
  )
  const [sortBy, setSortBy] = useState<SortBy>(
    (searchParams.get('sortBy') as SortBy) ?? 'createdAt',
  )
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    (searchParams.get('sortOrder') as SortOrder) ?? 'desc',
  )

  // Filter state
  const [brandId, setBrandId] = useState<Id<'brands'> | undefined>(
    (searchParams.get('brandId') as Id<'brands'>) ?? undefined,
  )
  const [categoryId, setCategoryId] = useState<Id<'categories'> | undefined>(
    (searchParams.get('categoryId') as Id<'categories'>) ?? undefined,
  )
  const [status, setStatus] = useState<ItemStatus | undefined>(
    (searchParams.get('status') as ItemStatus) ?? undefined,
  )

  // URL sync utilities
  const updateParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    }
    const search = newParams.toString()
    router.replace(`/manager/items${search ? `?${search}` : ''}`, {
      scroll: false,
    })
  }

  const handleSortChange = (newSortBy: SortBy) => {
    const newOrder =
      newSortBy === sortBy ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'desc'
    updateParams({ sortBy: newSortBy, sortOrder: newOrder, cursor: null })
    setSortBy(newSortBy)
    setSortOrder(newOrder)
    setCursor(null)
  }

  // Reset cursor when filters change
  const handleFilterChange = () => {
    updateParams({ cursor: null })
    setCursor(null)
  }

  const handleClearFilters = () => {
    updateParams({
      brandId: null,
      categoryId: null,
      status: null,
      cursor: null,
    })
    setBrandId(undefined)
    setCategoryId(undefined)
    setStatus(undefined)
    setCursor(null)
  }

  const handleBrandChange = (brand: string) => {
    const brandIdValue =
      brand === '__all__' ? undefined : (brand as Id<'brands'>)
    updateParams({ brandId: brandIdValue ?? null, cursor: null })
    setBrandId(brandIdValue)
    setCursor(null)
  }

  const handleCategoryChange = (category: string) => {
    const categoryIdValue =
      category === '__all__' ? undefined : (category as Id<'categories'>)
    updateParams({
      categoryId: categoryIdValue ? (categoryIdValue as string) : null,
      cursor: null,
    })
    setCategoryId(categoryIdValue)
    setCursor(null)
  }

  const handleStatusChange = (statusValue: string) => {
    const statusFilter =
      statusValue === '__all__' ? undefined : (statusValue as ItemStatus)
    updateParams({ status: statusFilter as string | null, cursor: null })
    setStatus(statusFilter)
    setCursor(null)
  }

  const handleNextPage = () => {
    if (itemsData?.continueCursor) {
      updateParams({ cursor: itemsData.continueCursor })
      setCursor(itemsData.continueCursor)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevPage = () => {
    updateParams({ cursor: null })
    setCursor(null)
    window.scrollTo(0, 0)
  }

  // Use preloaded query on initial page load
  const itemsDataPreloaded = usePreloadedQuery(itemsPreload)

  const normalizedSearch = searchQuery.trim()
  const isSearching = normalizedSearch.length > 0

  // Build query arguments - only include filter params if they have values
  const queryArgs: any = {
    paginationOpts: { numItems: 24, cursor },
    sortBy,
    sortOrder,
  }
  if (brandId !== undefined) queryArgs.brandId = brandId
  if (categoryId !== undefined) queryArgs.categoryId = categoryId
  if (status !== undefined) queryArgs.status = status

  // Fetch items reactively (so list updates after mutations)
  const searchArgs = {
    ...queryArgs,
    query: normalizedSearch,
  }
  const itemsDataQuery = useQuery(
    isSearching ? api.manager.search_items : api.manager.list_items,
    isSearching ? searchArgs : queryArgs,
  )

  const isDefaultQuery =
    !isSearching &&
    brandId === undefined &&
    categoryId === undefined &&
    status === undefined &&
    cursor === null &&
    sortBy === 'createdAt' &&
    sortOrder === 'desc'

  // Prefer reactive query, fallback to preloaded for initial render
  const itemsData =
    itemsDataQuery ?? (isDefaultQuery ? itemsDataPreloaded : undefined)

  const handlePreviousPage = () => {
    setCursor(null)
    window.scrollTo(0, 0)
  }

  const columns = getItemColumns({
    onEdit: (item: any) => {
      if (onEditItem) onEditItem(item)
    },
    onDelete: (id: any, name: string) => {
      if (onDeleteItem) onDeleteItem(id, name)
    },
  })

  return (
    <>
      {/* Filter Bar - ALWAYS RENDER */}
      <ItemsFilterBar
        brandId={brandId}
        categoryId={categoryId}
        status={status}
        onBrandChange={handleBrandChange}
        onCategoryChange={handleCategoryChange}
        onStatusChange={handleStatusChange}
        onClearFilters={handleClearFilters}
      />

      {!itemsData && (
        <div className='p-4 text-center text-gray-500'>Загрузка...</div>
      )}

      {itemsData && (!itemsData.page || itemsData.page.length === 0) && (
        <div className='p-4 text-center text-gray-500'>
          Товары не найдены в базе данных
        </div>
      )}

      {itemsData &&
        itemsData.page &&
        itemsData.page.length > 0 &&
        (() => {
          const transformedItems: (Item & {
            sku?: string
            brandId?: string
            [k: string]: any
          })[] = itemsData.page.map((item: any) => ({
            ...item,
            _id: item._id,
            name: item.name || 'Unknown',
            brand: item.brandName || item.brand || 'Unknown',
            quantity: item.quantity || 0,
            price: item.price || 0,
          }))

          return (
            <>
              <div className='flex items-center justify-between mb-4'>
                <div className='text-sm text-gray-600'>
                  Показано {itemsData.page.length} товаров
                </div>
                <div className='flex items-center gap-4'>
                  <span className='text-sm text-gray-600'>Сортировка:</span>
                  <Select
                    value={sortBy}
                    onValueChange={(v) => handleSortChange(v as SortBy)}
                  >
                    <SelectTrigger className='w-[180px]'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='createdAt'>По дате</SelectItem>
                      <SelectItem value='name'>По названию</SelectItem>
                      <SelectItem value='price'>По цене</SelectItem>
                      <SelectItem value='quantity'>По количеству</SelectItem>
                      <SelectItem value='ordersCount'>По заказам</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() =>
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }
                  >
                    <ArrowUpDown className='w-4 h-4 mr-1' />
                    {sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
                  </Button>
                </div>
              </div>
              <DataTable columns={columns} data={transformedItems} />

              {/* Pagination Controls */}
              <div className='flex items-center justify-between mt-6'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handlePreviousPage}
                  disabled={cursor === null}
                >
                  <ChevronLeft className='w-4 h-4 mr-2' />
                  Предыдущая
                </Button>

                <span className='text-sm text-gray-600'>
                  {cursor ? 'Страница 2+' : 'Страница 1'}
                </span>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleNextPage}
                  disabled={itemsData.isDone}
                >
                  Следующая
                  <ChevronRight className='w-4 h-4 ml-2' />
                </Button>
              </div>
            </>
          )
        })()}
    </>
  )
}
