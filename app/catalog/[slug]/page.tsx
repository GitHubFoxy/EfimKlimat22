import { preloadQuery } from 'convex/nextjs'
import { notFound } from 'next/navigation'
import { api } from '@/convex/_generated/api'
import { ItemClient } from './ItemClient'

export const dynamic = 'force-dynamic'

export default async function ItemPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // If there's no slug param, show not found
  if (!slug) {
    notFound()
  }

  // Preload item data on the server for better SEO and initial load performance
  const preloadedItem = await preloadQuery(api.catalog.show_item_by_slug, {
    slug: slug,
  })

  return <ItemClient preloadedItem={preloadedItem} itemSlug={slug} />
}
