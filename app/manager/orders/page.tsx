import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server'
import { preloadQuery } from 'convex/nextjs'
import { SidebarProvider } from '@/components/ui/sidebar'
import { api } from '@/convex/_generated/api'
import { requireManagerRoleWithTempPassword } from '@/lib/auth-server'
import { OrdersPageClient } from './orders-page-client'

interface OrdersPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const authState = await requireManagerRoleWithTempPassword()

  const params = await searchParams
  const cursor = (params.cursor as string) ?? null
  const token = await convexAuthNextjsToken()

  const ordersPreload = authState.mustChangePassword
    ? null
    : await preloadQuery(
        api.manager.list_orders,
        { paginationOpts: { numItems: 24, cursor } },
        { token },
      )

  return (
    <SidebarProvider suppressHydrationWarning>
      <OrdersPageClient
        ordersPreload={ordersPreload}
        shouldSkipLoad={authState.mustChangePassword}
        initialParams={{ cursor }}
      />
    </SidebarProvider>
  )
}
