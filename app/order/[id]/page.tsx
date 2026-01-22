'use client'

import { useQuery } from 'convex/react'
import { useParams } from 'next/navigation'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useCartSessionId } from '@/hooks/useCartSession'
import { OrderClient } from './OrderClient'

export default function OrderPage() {
  const params = useParams()
  const id = params.id as string
  const sessionId = useCartSessionId()

  const order = useQuery(api.orders.get_order_by_id, {
    id: id as Id<'orders'>,
    sessionId,
  })

  return <OrderClient order={order} />
}
