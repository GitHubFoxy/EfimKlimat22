import { preloadQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import { CatalogClient } from './CatalogClient'

export const dynamic = 'force-dynamic'

type FilterType = 'Хиты продаж' | 'Новинки' | 'Со скидкой'
const ALLOWED_FILTERS = new Set<FilterType>([
  'Хиты продаж',
  'Новинки',
  'Со скидкой',
])

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const rawFilter = resolvedParams.filter as string | undefined
  const filter: FilterType =
    rawFilter && ALLOWED_FILTERS.has(rawFilter as FilterType)
      ? (rawFilter as FilterType)
      : 'Хиты продаж'

  const preloadedCategories = await preloadQuery(
    api.catalog.catalog_list_all_categories,
  )
  const preloadedBrands = await preloadQuery(api.catalog.show_all_brands)

  return (
    <CatalogClient
      preloadedCategories={preloadedCategories}
      preloadedBrands={preloadedBrands}
      initialFilter={filter}
    />
  )
}
