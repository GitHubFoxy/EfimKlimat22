'use client'

import { useQuery } from 'convex/react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import { Icon } from '@/lib/consts'

export default function ManagerHeader({
  onLogout,
  onAddItem,
}: {
  onLogout: () => void
  onAddItem?: () => void
}) {
  // Fetch current user from server (role is verified server-side)
  const currentUser = useQuery(api.users.getCurrentUser)
  const managerDoc = currentUser

  return (
    <div className='flex items-center justify-between border-b pb-3'>
      <div className='flex items-center gap-3'>
        <Link href={'/'}>
          <Image src={Icon} alt='Логотип' width={80} height={36} />
        </Link>
        <div className='text-sm'>
          <div className='font-semibold'>Менеджер</div>
          <div className='text-muted-foreground'>
            {managerDoc
              ? `${managerDoc.name} (${managerDoc.phone})`
              : 'не выбран'}
          </div>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <Button onClick={onAddItem}>Добавить товар</Button>
        <Button variant='outline' onClick={onLogout}>
          Выйти
        </Button>
      </div>
    </div>
  )
}
