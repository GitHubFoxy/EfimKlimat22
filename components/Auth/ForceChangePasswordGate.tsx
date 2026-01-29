'use client'

import { useAction, useQuery } from 'convex/react'
import { useRouter } from 'next/navigation'
import { api } from '@/convex/_generated/api'
import { ForceChangePasswordDialog } from './ForceChangePasswordDialog'

export function ForceChangePasswordGate() {
  const router = useRouter()
  const currentUser = useQuery(api.users.getCurrentUserWithTempPassword)
  const changePassword = useAction(api.users.changePassword)

  const mustChangePassword = currentUser?.mustChangePassword ?? false

  if (!mustChangePassword) {
    return null
  }

  return (
    <ForceChangePasswordDialog
      onSubmit={async (newPassword) => {
        await changePassword({ newPassword })
        router.refresh()
      }}
    />
  )
}
