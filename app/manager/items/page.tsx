import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server'
import { preloadQuery } from 'convex/nextjs'
import { SidebarProvider } from '@/components/ui/sidebar'
import { api } from '@/convex/_generated/api'
import { requireManagerRole } from '@/lib/auth-server'
import { ItemsPageClient } from './items-page-client'

interface ItemsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  await requireManagerRole()

  const params = await searchParams
  const token = await convexAuthNextjsToken()
  const cursor = (params.cursor as string) ?? null
  const brandId = (params.brandId as string) ?? undefined
  const categoryId = (params.categoryId as string) ?? undefined
  const status = (params.status as string) ?? undefined
  const sortBy = (params.sortBy as string) ?? 'createdAt'
  const sortOrder = (params.sortOrder as string) ?? 'desc'

  const [itemsPreload, brandsPreload, categoriesPreload] = await Promise.all([
    preloadQuery(
      api.manager.list_items,
      {
        paginationOpts: { numItems: 24, cursor },
        ...(brandId ? { brandId: brandId as any } : {}),
        ...(categoryId ? { categoryId: categoryId as any } : {}),
        ...(status ? { status: status as any } : {}),
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      },
      { token },
    ),
    preloadQuery(api.manager.list_brands_all, {}, { token }),
    preloadQuery(api.manager.list_categories_all, {}, { token }),
  ])

  return (
    <SidebarProvider suppressHydrationWarning>
      <ItemsPageClient
        itemsPreload={itemsPreload}
        brandsPreload={brandsPreload}
        categoriesPreload={categoriesPreload}
        initialParams={{
          cursor,
          brandId: brandId ?? null,
          categoryId: categoryId ?? null,
          status: status ?? null,
          sortBy,
          sortOrder,
        }}
      />
    </SidebarProvider>
  )
}
