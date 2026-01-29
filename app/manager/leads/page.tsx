import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server'
import { preloadQuery } from 'convex/nextjs'
import { SidebarProvider } from '@/components/ui/sidebar'
import { api } from '@/convex/_generated/api'
import { requireManagerRoleWithTempPassword } from '@/lib/auth-server'
import { LeadsPageClient } from './leads-page-client'

interface LeadsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const authState = await requireManagerRoleWithTempPassword()

  const params = await searchParams
  const cursor = (params.cursor as string) ?? null
  const token = await convexAuthNextjsToken()

  const leadsPreload = authState.mustChangePassword
    ? null
    : await preloadQuery(
        api.manager.list_leads,
        { paginationOpts: { numItems: 24, cursor } },
        { token },
      )

  return (
    <SidebarProvider suppressHydrationWarning>
      <LeadsPageClient
        leadsPreload={leadsPreload}
        shouldSkipLoad={authState.mustChangePassword}
        initialParams={{ cursor }}
      />
    </SidebarProvider>
  )
}
