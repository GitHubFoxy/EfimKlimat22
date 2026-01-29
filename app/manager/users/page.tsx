import { SidebarProvider } from '@/components/ui/sidebar'
import { requireAdminRoleWithTempPassword } from '@/lib/auth-server'
import { UsersPageClient } from './users-page-client'

interface UsersPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const authState = await requireAdminRoleWithTempPassword()

  const params = await searchParams
  const role = (params.role as string) ?? 'users'

  return (
    <SidebarProvider suppressHydrationWarning>
      <UsersPageClient
        initialParams={{ role }}
        shouldSkipLoad={authState.mustChangePassword}
      />
    </SidebarProvider>
  )
}
