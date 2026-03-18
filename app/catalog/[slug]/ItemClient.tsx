'use client'

import { Preloaded, usePreloadedQuery, useQuery } from 'convex/react'
import Image from 'next/image'
import Link from 'next/link'
import { Footer } from '@/components/Footer'
import FreeConsultmant from '@/components/FreeConsultmant'
import Header from '@/components/Header/Header'
import ItemCard from '@/components/ItemCard'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'
import {
  cn,
  formatPrice,
  getRenderableSpecifications,
  getRussianPlural,
  type SpecificationsMap,
  type SpecificationValue,
} from '@/lib/utils'

type VariantItem = Doc<'items'> & {
  brandName?: string
  variantsCount?: number
}

const SECTION_VARIANT_KEYS = ['segments', 'sections', 'sectioncount'] as const
const POWER_VARIANT_KEYS = [
  'power',
  'powerkw',
  'moshchnost',
  'capacity',
] as const
const PREFERRED_VARIANT_KEYS = [
  ...SECTION_VARIANT_KEYS,
  ...POWER_VARIANT_KEYS,
] as const

function normalizeSpecificationKey(key: string) {
  return key
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
}

function getVariantSpecificationMap(specifications?: SpecificationsMap) {
  return new Map(
    getRenderableSpecifications(specifications).map(([key, value]) => [
      normalizeSpecificationKey(key),
      { key, value },
    ]),
  )
}

function formatVariantSpecificationValue(
  key: string,
  value: SpecificationValue,
): string {
  if (typeof value === 'boolean') {
    return `${key}: ${value ? 'Да' : 'Нет'}`
  }

  const raw = String(value).trim()
  const normalizedKey = normalizeSpecificationKey(key)
  const normalizedNumber = raw.replace(',', '.')
  const parsedNumber = Number(normalizedNumber)
  const isNumeric = raw.length > 0 && !Number.isNaN(parsedNumber)

  if (!isNumeric) {
    return raw
  }

  if (
    SECTION_VARIANT_KEYS.includes(
      normalizedKey as (typeof SECTION_VARIANT_KEYS)[number],
    )
  ) {
    if (Number.isInteger(parsedNumber)) {
      return getRussianPlural(parsedNumber, 'секция', 'секции', 'секций')
    }
    return `${raw} секций`
  }

  if (
    POWER_VARIANT_KEYS.includes(
      normalizedKey as (typeof POWER_VARIANT_KEYS)[number],
    )
  ) {
    return `${raw} кВт`
  }

  return raw
}

function getDifferingSpecificationKeys(items: VariantItem[]) {
  const specificationMaps = items.map((variant) =>
    getVariantSpecificationMap(variant.specifications),
  )
  const allKeys = new Set<string>()

  for (const map of specificationMaps) {
    for (const key of map.keys()) {
      allKeys.add(key)
    }
  }

  const differingKeys = new Set<string>()

  for (const key of allKeys) {
    const values = new Set(
      specificationMaps.map((map) => {
        const entry = map.get(key)
        return entry ? String(entry.value).trim() : '__missing__'
      }),
    )

    if (values.size > 1) {
      differingKeys.add(key)
    }
  }

  return differingKeys
}

function getVariantLabel(item: VariantItem, differingKeys: Set<string>) {
  const specificationMap = getVariantSpecificationMap(item.specifications)

  for (const key of PREFERRED_VARIANT_KEYS) {
    if (!differingKeys.has(key)) {
      continue
    }

    const entry = specificationMap.get(key)
    if (entry) {
      return formatVariantSpecificationValue(entry.key, entry.value)
    }
  }

  for (const [key, entry] of specificationMap.entries()) {
    if (!differingKeys.has(key)) {
      continue
    }

    return formatVariantSpecificationValue(entry.key, entry.value)
  }

  if (item.sku?.trim()) {
    return item.sku.trim()
  }

  return item.name
}

export function ItemClient({
  preloadedItem,
  itemSlug,
}: {
  preloadedItem: Preloaded<typeof api.catalog.show_item_by_slug>
  itemSlug: string
}) {
  // Use preloaded item data - server rendered and becomes reactive after hydration
  const item = usePreloadedQuery(preloadedItem)

  // Fetch related items by brand, category, and collection (client-side for reactivity)
  const relatedItems = useQuery(
    api.catalog.show_items_by_brand_and_collection,
    item && item.brandId && item.categoryId && item.collection
      ? {
          itemId: item._id,
          brandId: item.brandId,
          categoryId: item.categoryId,
          collection: item.collection,
        }
      : 'skip',
  ) as VariantItem[] | undefined
  const visibleSpecifications = getRenderableSpecifications(
    item?.specifications,
  )
  const variantItems =
    item !== null && item !== undefined
      ? ([item, ...(relatedItems ?? [])] as VariantItem[])
      : []
  const differingVariantKeys = getDifferingSpecificationKeys(variantItems)
  const showVariantSelector = variantItems.length > 1

  return (
    <div className='px-6 py-6 md:px-12 lg:px-28 xl:max-w-7xl xl:mx-auto'>
      <Header />

      {/* Breadcrumbs */}
      <div className='mt-4 mb-6'>
        {item ? (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href='/'>Главная</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href='/catalog'>Каталог</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>
                  {item.brandName ? item.brandName : ''} {item.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <div className='text-sm text-gray-500'>Загрузка навигации...</div>
        )}
      </div>

      {/* Main content */}
      {item === null ? (
        <div className='p-8 text-center'>Товар не найден</div>
      ) : (
        <>
          <div className='flex flex-col lg:flex-row gap-4 mt-4 items-start'>
            <div className='flex flex-col gap-4 flex-1'>
              <div className='bg-white rounded-3xl p-2 shadow-sm border border-gray-100'>
                <div className='max-w-sm mx-auto'>
                  <ItemCard
                    e={item}
                    variantCount={
                      item.variantsCount ??
                      (relatedItems ? relatedItems.length + 1 : undefined)
                    }
                  />
                </div>
              </div>

              {/* Related Items Section */}
              {showVariantSelector && item && (
                <div className='bg-white rounded-3xl p-4 shadow-sm border border-gray-100'>
                  <div className='mb-4 flex items-start justify-between gap-3'>
                    <div>
                      <h2 className='text-xl font-semibold'>
                        Варианты этой модели
                      </h2>
                      <p className='mt-1 text-sm text-gray-500'>
                        Выберите вариант. На карточках показано главное отличие
                        между ними.
                      </p>
                    </div>
                    <span className='rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600'>
                      {getRussianPlural(
                        variantItems.length,
                        'вариант',
                        'варианта',
                        'вариантов',
                      )}
                    </span>
                  </div>

                  <div className='grid grid-cols-2 gap-3 xl:grid-cols-3'>
                    {variantItems.map((variant) => {
                      const variantLabel = getVariantLabel(
                        variant,
                        differingVariantKeys,
                      )
                      const isCurrentVariant = variant._id === item._id
                      const variantImage =
                        variant.imagesUrl?.[0] || '/not-found.jpg'

                      const cardContent = (
                        <div
                          className={cn(
                            'rounded-2xl border p-3 transition-colors',
                            isCurrentVariant
                              ? 'border-slate-900 bg-slate-50 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                          )}
                        >
                          <div className='relative aspect-square overflow-hidden rounded-xl border border-gray-100 bg-gray-50'>
                            <Image
                              src={variantImage}
                              alt={variant.name}
                              fill
                              className='object-cover'
                              unoptimized={variantImage === '/not-found.jpg'}
                            />
                          </div>

                          <div className='mt-3 flex items-start justify-between gap-2'>
                            <div className='min-w-0'>
                              <p className='text-sm font-semibold text-gray-900'>
                                {variantLabel}
                              </p>
                              {variantLabel !== variant.name && (
                                <p className='mt-1 line-clamp-2 text-xs text-gray-500'>
                                  {variant.name}
                                </p>
                              )}
                            </div>

                            {isCurrentVariant && (
                              <span className='shrink-0 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-medium text-white'>
                                Выбрано
                              </span>
                            )}
                          </div>

                          <p className='mt-2 text-sm font-medium text-amber-600'>
                            {formatPrice(variant.price)} руб.
                          </p>
                        </div>
                      )

                      if (isCurrentVariant) {
                        return <div key={variant._id}>{cardContent}</div>
                      }

                      return (
                        <Link
                          key={variant._id}
                          href={`/catalog/${variant.slug}`}
                          className='block'
                        >
                          {cardContent}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className='bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1'>
              <h1 className='text-2xl font-semibold mb-2'>
                {item.brandName ? item.brandName : ''} {item.name}
              </h1>

              <p className='text-lg font-medium mb-2 text-amber-600'>
                {formatPrice(item.price)} руб.
              </p>

              <p className='text-sm text-gray-500 mb-4'>
                В наличии: {item.quantity ?? '—'}
              </p>

              <div className='text-sm text-gray-700 whitespace-pre-line mb-4'>
                {item.description ?? 'Описание отсутствует'}
              </div>

              {/* Specifications Table */}
              {visibleSpecifications.length > 0 && (
                <div className='mt-6'>
                  <h3 className='text-sm font-semibold text-gray-900 mb-3 border-b pb-2'>
                    Характеристики
                  </h3>
                  <div className='space-y-2'>
                    {visibleSpecifications.map(([key, value]) => (
                      <div
                        key={key}
                        className='flex justify-between text-sm py-1 border-b border-gray-50 last:border-0'
                      >
                        <span className='text-gray-500'>{key}</span>
                        <span className='font-medium text-gray-900'>
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {item.discountAmount ? (
                <span className='text-sm text-red-600 font-medium'>
                  Скидка: {item.discountAmount}%
                </span>
              ) : null}
            </div>
          </div>

          {/* Free consultation section */}
          <div className='mt-10'>
            <FreeConsultmant />
          </div>

          {/* Footer */}
          <div className='mt-12'>
            <Footer />
          </div>
        </>
      )}
    </div>
  )
}
