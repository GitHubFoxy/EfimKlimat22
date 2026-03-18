'use client'
import { useQuery } from 'convex/react'
import { Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { api } from '@/convex/_generated/api'
import { getRenderableSpecifications } from '@/lib/utils'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export default function HeaderSearch({ className }: { className?: string }) {
  const [searchValue, setSearchValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchValue), 200)
    return () => clearTimeout(t)
  }, [searchValue])

  const searchResults =
    useQuery(api.main.search_items, { query: debounced }) ?? []
  const topItems = useQuery(api.main.top_items_by_orders, { limit: 3 }) ?? []

  const results = debounced ? searchResults : topItems

  return (
    <div
      className={twMerge(
        'relative flex flex-row items-center justify-center rounded-full px-2 outline border border-gray-200 bg-white',
        className,
      )}
      onClick={() => ref.current?.focus()}
    >
      <Search className='opacity-50 mr-2' />
      <Input
        ref={ref}
        placeholder='Поиск товаров'
        value={searchValue}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 100)}
        onChange={(e) => setSearchValue(e.target.value)}
        className='outline-none border-none focus-visible:outline-none focus-visible:ring-0 px-0'
      />

      {isOpen && results?.length > 0 && (
        <div className='absolute left-0 top-full mt-2 w-[min(28rem,80vw)] max-h-80 overflow-auto rounded-2xl border border-gray-200 bg-white shadow-lg z-20'>
          <ul className='divide-y'>
            {results.map((item: any) => {
              const slug = item.slug || ''
              const visibleSpecifications = getRenderableSpecifications(
                item.specifications,
              )
              return (
                <li
                  key={item._id}
                  onMouseDown={(e) => {
                    // Prevent input blur so click navigates cleanly.
                    e.preventDefault()
                  }}
                >
                  <Link
                    href={`/catalog/${slug}`}
                    className='flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer'
                    onClick={() => {
                      setSearchValue(item.name)
                      setIsOpen(false)
                    }}
                    aria-label={`Открыть ${item.name}`}
                  >
                    {/* Thumbnail */}
                    {item.imagesUrl && item.imagesUrl.length > 0 && (
                      <Image
                        src={item.imagesUrl[0]}
                        alt={item.name}
                        width={40}
                        height={40}
                        className='rounded-md object-cover'
                      />
                    )}
                    {/* Title & Price */}
                    <div className='flex-1'>
                      {/* Brand - Name */}
                      <div className='text-sm font-medium text-gray-900 line-clamp-1'>
                        <span className='font-semibold'>
                          {item.brandName || 'Неизвестно'}
                        </span>
                        {' - '}
                        <span>{item.name}</span>
                      </div>
                      {/* Specification (power, etc) */}
                      {visibleSpecifications.length > 0 && (
                        <div className='text-xs text-gray-500 line-clamp-1'>
                          {visibleSpecifications
                            .filter(([key]) => {
                              const lowerKey = key.toLowerCase()
                              return (
                                lowerKey.includes('power') ||
                                lowerKey.includes('мощность') ||
                                lowerKey.includes('kw')
                              )
                            })
                            .slice(0, 1)
                            .map(([key, value]) => `${value}`)
                            .join(', ') ||
                            visibleSpecifications
                              .slice(0, 1)
                              .map(([key, value]) => `${value}`)
                              .join(', ')}
                        </div>
                      )}
                      {/* Price */}
                      {typeof item.price === 'number' && (
                        <div className='text-xs text-gray-600 font-medium'>
                          {item.price} ₽
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
            <li
              className='p-2'
              onMouseDown={(e) => {
                // Prevent input blur so click navigates cleanly.
                e.preventDefault()
              }}
            >
              <Button
                asChild
                variant='outline'
                size='sm'
                className='w-full justify-center rounded-xl bg-light-orange text-white'
              >
                <Link
                  href={
                    debounced
                      ? `/catalog?query=${encodeURIComponent(debounced)}`
                      : '/catalog'
                  }
                  aria-label='Смотреть все результаты'
                >
                  Смотреть все
                </Link>
              </Button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
