'use client'

import { CheckCircle2, CreditCard, Package, Truck } from 'lucide-react'
import { Footer } from '@/components/Footer'
import Header from '@/components/Header/Header'
import { formatPrice } from '@/lib/utils'

type OrderData = {
  _id: string
  publicNumber: number
  clientPhone: string
  deliveryType: string
  address?: { city: string; street: string; details?: string }
  paymentMethod: string
  paymentStatus: string
  totalAmount: number
  items: Array<{ _id: string; name: string; quantity: number; price: number }>
}

export function OrderClient({
  order,
}: {
  order: OrderData | null | undefined
}) {
  if (order === undefined) {
    return (
      <div className='px-6 py-2 md:px-12 lg:px-28'>
        <Header />
        <div className='min-h-[400px] flex items-center justify-center'>
          <p>Загрузка...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (order === null) {
    return (
      <div className='px-6 py-2 md:px-12 lg:px-28'>
        <Header />
        <div className='min-h-[400px] flex items-center justify-center'>
          <p>Заказ не найден</p>
        </div>
        <Footer />
      </div>
    )
  }

  const deliveryLabels: Record<string, string> = {
    pickup: 'Самовывоз',
    courier: 'Доставка курьером',
    transport: 'Транспортная компания',
  }

  const paymentLabels: Record<string, string> = {
    cash_on_delivery: 'Наличными при получении',
    card_on_delivery: 'Картой при получении',
    b2b_invoice: 'Счет на оплату',
  }

  return (
    <div className='px-6 py-2 md:px-12 lg:px-28'>
      <Header />

      <div className='max-w-4xl mx-auto my-12'>
        <div className='bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden'>
          {/* Success Banner */}
          <div className='bg-green-50 p-8 text-center border-b border-green-100'>
            <CheckCircle2 className='w-16 h-16 text-green-500 mx-auto mb-4' />
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Заказ №{order.publicNumber} принят!
            </h1>
            <p className='text-gray-600'>
              Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время.
            </p>
          </div>

          <div className='p-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
              {/* Order Details */}
              <div className='space-y-8'>
                <div>
                  <h2 className='text-lg font-semibold flex items-center gap-2 mb-4'>
                    <Package className='w-5 h-5 text-amber-500' />
                    Состав заказа
                  </h2>
                  <div className='space-y-4'>
                    {order.items.map((item: any) => (
                      <div
                        key={item._id}
                        className='flex justify-between text-sm'
                      >
                        <span className='text-gray-600'>
                          {item.name} x {item.quantity}
                        </span>
                        <span className='font-medium'>
                          {formatPrice(item.price * item.quantity)} ₽
                        </span>
                      </div>
                    ))}
                    <div className='pt-4 border-t flex justify-between font-bold text-lg'>
                      <span>Итого</span>
                      <span>{formatPrice(order.totalAmount)} ₽</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className='text-lg font-semibold flex items-center gap-2 mb-4'>
                    <CreditCard className='w-5 h-5 text-amber-500' />
                    Оплата
                  </h2>
                  <p className='text-sm text-gray-600'>
                    {paymentLabels[order.paymentMethod] || order.paymentMethod}
                  </p>
                  <p className='text-xs text-amber-600 mt-1'>
                    Статус:{' '}
                    {order.paymentStatus === 'pending'
                      ? 'Ожидает оплаты'
                      : 'Оплачено'}
                  </p>
                </div>
              </div>

              {/* Delivery Details */}
              <div className='space-y-8'>
                <div>
                  <h2 className='text-lg font-semibold flex items-center gap-2 mb-4'>
                    <Truck className='w-5 h-5 text-amber-500' />
                    Доставка
                  </h2>
                  <div className='space-y-2 text-sm'>
                    <p>
                      <span className='text-gray-500'>Способ: </span>
                      {deliveryLabels[order.deliveryType] || order.deliveryType}
                    </p>
                    {order.address && (
                      <p>
                        <span className='text-gray-500'>Адрес: </span>
                        {order.address.city}, {order.address.street}
                        {order.address.details && `, ${order.address.details}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className='bg-gray-50 p-6 rounded-2xl'>
                  <h3 className='font-semibold mb-2'>Что дальше?</h3>
                  <ul className='text-sm text-gray-600 space-y-3'>
                    <li className='flex gap-2'>
                      <span className='bg-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border border-gray-200'>
                        1
                      </span>
                      Наш менеджер проверит наличие товара
                    </li>
                    <li className='flex gap-2'>
                      <span className='bg-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border border-gray-200'>
                        2
                      </span>
                      Мы позвоним вам по номеру {order.clientPhone}
                    </li>
                    <li className='flex gap-2'>
                      <span className='bg-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border border-gray-200'>
                        3
                      </span>
                      Уточним детали и подтвердим доставку
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
