'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatPrice } from '@/lib/utils'
import { type ConvexOrder } from './columns'

interface OrderDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  order: ConvexOrder | null
}

const statusMap: Record<ConvexOrder['status'], string> = {
  new: 'Новый',
  confirmed: 'Подтвержден',
  processing: 'В обработке',
  shipping: 'Отправлен',
  done: 'Завершен',
  canceled: 'Отменен',
}

const paymentMethodMap: Record<ConvexOrder['paymentMethod'], string> = {
  cash_on_delivery: 'Наличными при получении',
  card_on_delivery: 'Картой при получении',
  b2b_invoice: 'Счет B2B',
}

const paymentStatusMap: Record<ConvexOrder['paymentStatus'], string> = {
  pending: 'Ожидание',
  paid: 'Оплачено',
  failed: 'Ошибка',
  refunded: 'Возврат',
}

const deliveryTypeMap: Record<
  NonNullable<ConvexOrder['deliveryType']>,
  string
> = {
  pickup: 'Самовывоз',
  courier: 'Курьер',
  transport: 'Транспортная компания',
}

export function OrderDetailsDialog({
  isOpen,
  onClose,
  order,
}: OrderDetailsDialogProps) {
  const orderItems = order?.items ?? []
  const formattedUpdatedAt = order?.updatedAt
    ? new Date(order.updatedAt).toLocaleString('ru-RU')
    : '—'

  const formattedItemsTotal = formatPrice(order?.itemsTotal ?? 0)
  const formattedDeliveryPrice = formatPrice(order?.deliveryPrice ?? 0)
  const formattedTotalAmount = formatPrice(order?.totalAmount ?? 0)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <DialogContent className='sm:max-w-[640px]'>
        <DialogHeader>
          <DialogTitle>Заказ №{order?.publicNumber ?? '—'}</DialogTitle>
          <DialogDescription>
            Быстрая карточка заказа для прозвона клиента и подтверждения
            наличия.
          </DialogDescription>
        </DialogHeader>

        {order ? (
          <div className='space-y-5 py-1'>
            <div className='grid grid-cols-1 gap-3 text-sm sm:grid-cols-2'>
              <div>
                <p className='text-gray-500'>Клиент</p>
                <p className='font-medium'>{order.clientName}</p>
              </div>
              <div>
                <p className='text-gray-500'>Телефон</p>
                <p className='font-medium'>{order.clientPhone}</p>
              </div>
              <div>
                <p className='text-gray-500'>Email</p>
                <p className='font-medium'>{order.clientEmail || '—'}</p>
              </div>
              <div>
                <p className='text-gray-500'>Последнее обновление</p>
                <p className='font-medium'>{formattedUpdatedAt}</p>
              </div>
            </div>

            <div className='rounded-md border p-3 text-sm'>
              <p className='font-medium mb-2'>Состав заказа</p>
              {orderItems.length > 0 ? (
                <div className='space-y-2'>
                  {orderItems.map((item, index) => (
                    <div
                      key={`${item._id}-${index}`}
                      className='flex items-start justify-between gap-3'
                    >
                      <div>
                        <p className='font-medium'>{item.name}</p>
                        {item.sku ? (
                          <p className='text-xs text-gray-500'>
                            Артикул: {item.sku}
                          </p>
                        ) : null}
                        <p className='text-xs text-gray-500'>
                          Количество: {item.quantity}
                        </p>
                      </div>
                      <p className='whitespace-nowrap'>
                        {formatPrice(item.price * item.quantity)} ₽
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-gray-500'>Позиции заказа не найдены.</p>
              )}
            </div>

            <div className='rounded-md border bg-gray-50 p-3 text-sm'>
              <p className='font-medium mb-2'>Статусы</p>
              <p>Заказ: {statusMap[order.status]}</p>
              <p>Оплата: {paymentStatusMap[order.paymentStatus]}</p>
              <p>Способ оплаты: {paymentMethodMap[order.paymentMethod]}</p>
            </div>

            <div className='rounded-md border p-3 text-sm'>
              <p className='font-medium mb-2'>Доставка и сумма</p>
              <p>
                Способ доставки:{' '}
                {order.deliveryType ? deliveryTypeMap[order.deliveryType] : '—'}
              </p>
              <p>
                Адрес:{' '}
                {order.address
                  ? `${order.address.city}, ${order.address.street}${order.address.details ? `, ${order.address.details}` : ''}`
                  : '—'}
              </p>
              <p>Товары: {formattedItemsTotal} ₽</p>
              <p>Доставка: {formattedDeliveryPrice} ₽</p>
              <p className='font-medium'>Итого: {formattedTotalAmount} ₽</p>
            </div>

            {(order.comment || order.managerNote) && (
              <div className='rounded-md border p-3 text-sm'>
                {order.comment && (
                  <p>
                    Комментарий клиента: <span>{order.comment}</span>
                  </p>
                )}
                {order.managerNote && (
                  <p>
                    Заметка менеджера: <span>{order.managerNote}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
