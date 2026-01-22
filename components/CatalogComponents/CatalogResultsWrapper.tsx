'use client'

import { Id } from '@/convex/_generated/dataModel'

type FilterType = 'Хиты продаж' | 'Новинки' | 'Со скидкой'

interface CatalogResultsWrapperProps {
  selectedCategoryId: Id<'categories'> | null
  selectedFilter: FilterType
  selectedSubcategory: string | null
  priceSort: 'asc' | 'desc' | null
  selectedBrand: Id<'brands'> | null
  selectedBrandSlug: string | null
  onClearBrandFilter: () => void
  groupByCollection: boolean
  CatalogResultsComponent: React.ComponentType<{
    categoryId: Id<'categories'> | null
    filter: FilterType
    subcategory?: string | null
    priceSort?: 'asc' | 'desc' | null
    selectedBrand?: Id<'brands'> | null
    selectedBrandSlug?: string | null
    onClearBrandFilter: () => void
    groupByCollection: boolean
  }>
}

export default function CatalogResultsWrapper({
  selectedCategoryId,
  selectedFilter,
  selectedSubcategory,
  priceSort,
  selectedBrand,
  selectedBrandSlug,
  onClearBrandFilter,
  groupByCollection,
  CatalogResultsComponent,
}: CatalogResultsWrapperProps) {
  return (
    <CatalogResultsComponent
      categoryId={selectedCategoryId}
      filter={selectedFilter}
      subcategory={selectedSubcategory === 'none' ? null : selectedSubcategory}
      priceSort={priceSort}
      selectedBrand={selectedBrand}
      selectedBrandSlug={selectedBrandSlug}
      onClearBrandFilter={onClearBrandFilter}
      groupByCollection={groupByCollection}
    />
  )
}
