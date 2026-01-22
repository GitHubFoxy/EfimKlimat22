import { redirect } from 'next/navigation'
import { requireManagerRole } from '@/lib/auth-server'

export default async function ManagerPage() {
  await requireManagerRole()
  redirect('/manager/items')
}
