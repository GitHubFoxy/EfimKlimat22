'use client'

import { useAction, useQuery } from 'convex/react'
import { Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ForceChangePasswordDialog } from '@/components/Auth/ForceChangePasswordDialog'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { api } from '@/convex/_generated/api'
import { DeleteUserDialog } from '../delete-user-dialog'
import { UserFormDialog } from '../user-form-dialog'
import { UsersTableContent } from '../users-table-content'

interface UsersPageClientProps {
  initialParams: {
    role: string
  }
}

export function UsersPageClient({ initialParams }: UsersPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [localDebouncedSearch, setLocalDebouncedSearch] = useState('')

  const currentUser = useQuery(api.users.getCurrentUserWithTempPassword)
  const changePassword = useAction(api.users.changePassword)

  // Show password change dialog if mustChangePassword is true
  const showPasswordChange = currentUser?.mustChangePassword ?? false

  // Dialog state for create/edit users
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)

  // Dialog state for delete user
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<any | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const openCreateDialog = () => {
    setEditingUser(null)
    setIsUserDialogOpen(true)
  }

  const handleDeleteUser = (user: any) => {
    setDeletingUser(user)
    setIsDeleteUserDialogOpen(true)
  }

  return (
    <div className='flex h-screen w-full'>
      <AppSidebar />
      <div className='flex flex-col flex-1'>
        {/* Header */}
        <header className='border-b-2 bg-white'>
          <div className='flex items-center justify-between px-8 py-4'>
            <div className='flex items-center gap-4'>
              <SidebarTrigger />
              <h1 className='text-xl font-semibold text-gray-900'>
                Пользователи
              </h1>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                className='bg-gray-900 hover:bg-gray-800 text-white'
                onClick={openCreateDialog}
              >
                <Plus className='w-4 h-4 mr-2' />
                Добавить
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='flex-1 overflow-auto'>
          <div className='p-8 space-y-6'>
            {/* Search & Filters */}
            <div className='flex gap-4'>
              <div className='flex-1 relative max-w-md'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                <Input
                  placeholder='Поиск пользователей...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            {/* Users Table */}
            <UsersTableContent
              searchQuery={localDebouncedSearch}
              onEditUser={(user) => {
                setEditingUser(user)
                setIsUserDialogOpen(true)
              }}
              onDeleteUser={handleDeleteUser}
            />
          </div>
        </main>
      </div>

      {/* User Form Dialog (Create / Edit) */}
      <UserFormDialog
        isOpen={isUserDialogOpen}
        onClose={() => {
          setIsUserDialogOpen(false)
          setEditingUser(null)
        }}
        user={editingUser ?? undefined}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        isOpen={isDeleteUserDialogOpen}
        onClose={() => {
          setIsDeleteUserDialogOpen(false)
          setDeletingUser(null)
        }}
        userId={deletingUser?._id ?? null}
        userName={deletingUser?.name ?? ''}
      />

      {/* Force Change Password Dialog */}
      {showPasswordChange && (
        <ForceChangePasswordDialog
          onSubmit={async (newPassword) => {
            await changePassword({ newPassword })
          }}
        />
      )}
    </div>
  )
}
