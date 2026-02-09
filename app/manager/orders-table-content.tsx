'use client'

import { useMutation, useQuery } from 'convex/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { type ConvexOrder, getOrderColumns } from './columns'
import { DataTable } from './data-table'
import { DeleteOrderDialog } from './delete-order-dialog'
import { OrderDetailsDialog } from './order-details-dialog'

export function OrdersTableContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [cursor, setCursor] = useState<string | null>(
    (searchParams.get('cursor') as string) ?? null,
  )

  // URL sync utilities
  const updateParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    }
    const search = newParams.toString()
    router.replace(`/manager/orders${search ? `?${search}` : ''}`, {
      scroll: false,
    })
  }
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<{
    id: Id<'orders'>
    publicNumber: number
  } | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<ConvexOrder | null>(null)
  const updateStatus = useMutation(api.manager.update_order_status)

  // Fetch orders data with pagination
  const ordersData = useQuery(api.manager.list_orders, {
    paginationOpts: { numItems: 24, cursor },
  })

  const handleStatusChange = async (
    orderId: any,
    status: ConvexOrder['status'],
  ) => {
    try {
      await updateStatus({ orderId, status })
      toast.success('Статус заказа обновлен')
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Ошибка при обновлении статуса')
    }
  }

  const handleDeleteOrder = (orderId: Id<'orders'>, orderNumber: number) => {
    setOrderToDelete({ id: orderId, publicNumber: orderNumber })
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setOrderToDelete(null)
  }

  if (!ordersData) {
    return (
      <div className='p-4 text-center text-gray-500'>Загрузка заказов...</div>
    )
  }

  if (!ordersData.page || ordersData.page.length === 0) {
    return (
      <div className='p-4 text-center text-gray-500'>
        Заказы не найдены в базе данных
      </div>
    )
  }

  // Transform Convex order data to match ConvexOrder interface
  const transformedOrders: ConvexOrder[] = ordersData.page.map(
    (order: any) => ({
      _id: order._id,
      publicNumber: order.publicNumber || 0,
      clientName: order.clientName || 'Unknown',
      clientPhone: order.clientPhone || 'Unknown',
      clientEmail: order.clientEmail,
      deliveryType: order.deliveryType,
      address: order.address,
      items: Array.isArray(order.items)
        ? order.items.map((item: any) => ({
            _id: item._id,
            itemId: item.itemId,
            name: item.name || 'Товар',
            sku: item.sku,
            price: item.price || 0,
            quantity: item.quantity || 0,
          }))
        : [],
      deliveryPrice: order.deliveryPrice || 0,
      itemsTotal: order.itemsTotal || 0,
      status: order.status || 'new',
      totalAmount: order.totalAmount || 0,
      paymentMethod: order.paymentMethod || 'cash_on_delivery',
      paymentStatus: order.paymentStatus || 'pending',
      comment: order.comment,
      managerNote: order.managerNote,
      updatedAt: order.updatedAt || 0,
    }),
  )

  const handleOpenOrderDialog = (order: ConvexOrder) => {
    setSelectedOrder(order)
    setOrderDialogOpen(true)
  }

  const handleCloseOrderDialog = () => {
    setOrderDialogOpen(false)
    setSelectedOrder(null)
  }

  const orderColumns = getOrderColumns({
    onStatusChange: handleStatusChange,
    onOpenOrder: handleOpenOrderDialog,
    onDeleteOrder: (orderId) => {
      const order = transformedOrders.find((o) => o._id === orderId)
      if (order) {
        handleDeleteOrder(orderId as Id<'orders'>, order.publicNumber)
      }
    },
  })

  const handleNextPage = () => {
    if (ordersData.continueCursor) {
      updateParams({ cursor: ordersData.continueCursor })
      setCursor(ordersData.continueCursor)
      window.scrollTo(0, 0)
    }
  }

  const handlePreviousPage = () => {
    updateParams({ cursor: null })
    setCursor(null)
    window.scrollTo(0, 0)
  }

  return (
    <>
      <div className='text-sm text-gray-600 mb-4'>
        Показано {ordersData.page.length} заказов
      </div>
      <DataTable columns={orderColumns} data={transformedOrders} />

      {/* Pagination Controls */}
      <div className='flex items-center justify-between mt-6'>
        <Button
          variant='outline'
          size='sm'
          onClick={handlePreviousPage}
          disabled={cursor === null}
        >
          <ChevronLeft className='w-4 h-4 mr-2' />
          Предыдущая
        </Button>

        <span className='text-sm text-gray-600'>
          {cursor ? 'Страница 2+' : 'Страница 1'}
        </span>

        <Button
          variant='outline'
          size='sm'
          onClick={handleNextPage}
          disabled={ordersData.isDone}
        >
          Следующая
          <ChevronRight className='w-4 h-4 ml-2' />
        </Button>
      </div>

      {/* Delete Order Dialog */}
      <DeleteOrderDialog
        isOpen={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        orderId={orderToDelete?.id || null}
        orderNumber={orderToDelete?.publicNumber || 0}
      />
      <OrderDetailsDialog
        isOpen={orderDialogOpen}
        onClose={handleCloseOrderDialog}
        order={selectedOrder}
      />
    </>
  )
}
