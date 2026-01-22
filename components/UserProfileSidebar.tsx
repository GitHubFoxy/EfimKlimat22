'use client'

import { useAuthActions } from '@convex-dev/auth/react'
import { useAction, useQuery } from 'convex/react'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'

export function UserProfileSidebar() {
  const currentUser = useQuery(api.users.getCurrentUser)
  const { signOut } = useAuthActions()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    // Clear session data (role is now server-managed)
    window.localStorage.removeItem('cartSessionId')
    router.push('/auth/signin')
  }

  if (currentUser === undefined) {
    return null
  }

  if (!currentUser) {
    return null
  }

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: 'Администратор',
      manager: 'Менеджер',
      user: 'Пользователь',
    }
    return roleMap[role] || role
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-red-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-pink-500',
    ]
    return colors[name.length % colors.length]
  }

  const initials =
    currentUser.name
      ?.split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase() || '?'

  return (
    <div className='border-t p-4 space-y-4'>
      {/* User Profile Card */}
      <div className='flex gap-3'>
        {/* Avatar */}
        <div
          className={`w-12 h-12 rounded-lg ${getAvatarColor(
            currentUser.name || '',
          )} flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm`}
        >
          {initials}
        </div>

        {/* User Info */}
        <div className='flex-1 min-w-0'>
          <p className='font-medium text-sm text-gray-900 truncate'>
            {currentUser.name || 'Пользователь'}
          </p>
          <p className='text-xs text-gray-500 truncate'>
            {currentUser.phone || 'Нет номера'}
          </p>
          <p className='text-xs text-gray-400 mt-1'>
            {getRoleLabel(currentUser.role || 'user')}
          </p>
        </div>
      </div>

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        variant='outline'
        size='sm'
        className='w-full text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer'
      >
        <LogOut className='w-4 h-4 mr-2' />
        Выход
      </Button>
    </div>
  )
}
