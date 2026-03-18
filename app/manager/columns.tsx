'use client'

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface Order {
  _id: string
  name: string
  email: string
  status: 'new' | 'processing' | 'completed'
  value: number
  createdAt: string
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'name',
    header: 'Клиент',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusMap: { [key: string]: string } = {
        new: 'Новый',
        processing: 'В обработке',
        completed: 'Завершен',
      }
      return (
        <span
          className={`px-2 py-0.5 rounded text-xs ${
            status === 'new'
              ? 'bg-gray-100 text-gray-700'
              : status === 'processing'
                ? 'bg-gray-200 text-gray-700'
                : 'bg-gray-900 text-white'
          }`}
        >
          {statusMap[status] || status}
        </span>
      )
    },
  },
  {
    accessorKey: 'value',
    header: 'Сумма',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('value') as any)
      const formatted = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
      }).format(amount)
      return <div className='font-medium'>{formatted}</div>
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Открыть меню</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order._id)}
            >
              Копировать ID заказа
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Просмотр заказа</DropdownMenuItem>
            <DropdownMenuItem>Редактировать заказ</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export interface Item {
  _id: string
  name: string
  brand: string // This can be brand name or ID
  quantity: number
  price: number
  slug?: string
  sku?: string
}

// Provide a factory to create item columns so parent components can pass handlers
export const getItemColumns = (handlers?: {
  onEdit?: (item: any) => void
  onDelete?: (id: any, name: string) => void
}): ColumnDef<Item>[] => {
  const { onEdit, onDelete } = handlers || {}

  return [
    {
      accessorKey: 'name',
      header: 'Товар',
      cell: ({ row }) => {
        const name = row.getValue('name') as string
        const item = row.original as Item
        return (
          <div>
            {item.slug ? (
              <Link
                href={`/catalog/${item.slug}`}
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 rounded-sm'
              >
                {name}
              </Link>
            ) : (
              <div className='font-medium'>{name}</div>
            )}
            {item.sku && (
              <div className='text-xs text-gray-500'>{item.sku}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'brand',
      header: 'Бренд',
      cell: ({ row }) => {
        const brand = row.getValue('brand') as string
        return <div>{brand}</div>
      },
    },
    {
      accessorKey: 'quantity',
      header: 'Количество',
    },
    {
      accessorKey: 'price',
      header: 'Цена',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('price') as any)
        const formatted = new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
        }).format(amount)
        return <div className='font-medium'>{formatted}</div>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original as any
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Открыть меню</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Действия</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  if (onEdit) onEdit(item)
                }}
              >
                Редактировать товар
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (onDelete) onDelete(item._id, item.name)
                }}
              >
                Удалить товар
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

export interface Lead {
  _id: string
  name: string
  email?: string
  phone: string
  type: 'callback' | 'product_question' | 'project_calculation' | 'installation'
  status: 'new' | 'processing' | 'success' | 'failed'
  message?: string
  updatedAt: number
}

export const leadColumns: ColumnDef<Lead>[] = [
  {
    accessorKey: 'name',
    header: 'Имя',
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      return <div className='font-medium'>{name}</div>
    },
  },
  {
    accessorKey: 'phone',
    header: 'Телефон',
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      const email = row.getValue('email') as string | undefined
      return <div>{email || '-'}</div>
    },
  },
  {
    accessorKey: 'type',
    header: 'Тип',
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      const typeMap: { [key: string]: string } = {
        callback: 'Обратный звонок',
        product_question: 'Вопрос о товаре',
        project_calculation: 'Расчет проекта',
        installation: 'Установка',
      }
      return <div className='text-sm'>{typeMap[type] || type}</div>
    },
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusMap: { [key: string]: string } = {
        new: 'Новый',
        processing: 'В обработке',
        success: 'Успешно',
        failed: 'Неудачно',
      }
      return (
        <span
          className={`px-2 py-0.5 rounded text-xs ${
            status === 'new'
              ? 'bg-blue-100 text-blue-700'
              : status === 'processing'
                ? 'bg-yellow-100 text-yellow-700'
                : status === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
          }`}
        >
          {statusMap[status] || status}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Открыть меню</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuItem>Просмотр лида</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Назначить менеджера</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export interface ConvexOrder {
  _id: string
  publicNumber: number
  clientName: string
  clientPhone: string
  clientEmail?: string
  deliveryType?: 'pickup' | 'courier' | 'transport'
  address?: {
    city: string
    street: string
    details?: string
  }
  items?: Array<{
    _id: string
    itemId?: string
    name: string
    sku?: string
    price: number
    quantity: number
  }>
  deliveryPrice?: number
  itemsTotal?: number
  status: 'new' | 'confirmed' | 'processing' | 'shipping' | 'done' | 'canceled'
  totalAmount: number
  paymentMethod: 'cash_on_delivery' | 'card_on_delivery' | 'b2b_invoice'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  comment?: string
  managerNote?: string
  updatedAt: number
}

export const getOrderColumns = (handlers?: {
  onStatusChange?: (
    orderId: ConvexOrder['_id'],
    status: ConvexOrder['status'],
  ) => void
  onDeleteOrder?: (orderId: ConvexOrder['_id']) => void
  onOpenOrder?: (order: ConvexOrder) => void
}): ColumnDef<ConvexOrder>[] => {
  const { onStatusChange, onDeleteOrder, onOpenOrder } = handlers || {}

  return [
    {
      accessorKey: 'publicNumber',
      header: '№ Заказа',
      cell: ({ row }) => {
        const number = row.getValue('publicNumber') as number
        const order = row.original
        return (
          <button
            type='button'
            className='font-medium text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 rounded-sm'
            onClick={() => onOpenOrder?.(order)}
          >
            #{number}
          </button>
        )
      },
    },
    {
      accessorKey: 'clientName',
      header: 'Клиент',
      cell: ({ row }) => {
        const name = row.getValue('clientName') as string
        return <div className='font-medium'>{name}</div>
      },
    },
    {
      accessorKey: 'clientPhone',
      header: 'Телефон',
    },
    {
      accessorKey: 'status',
      header: 'Статус',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const statusMap: { [key: string]: string } = {
          new: 'Новый',
          confirmed: 'Подтвержден',
          processing: 'В обработке',
          shipping: 'Отправлен',
          done: 'Завершен',
          canceled: 'Отменен',
        }
        return (
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              status === 'new'
                ? 'bg-blue-100 text-blue-700'
                : status === 'confirmed'
                  ? 'bg-purple-100 text-purple-700'
                  : status === 'processing'
                    ? 'bg-yellow-100 text-yellow-700'
                    : status === 'shipping'
                      ? 'bg-cyan-100 text-cyan-700'
                      : status === 'done'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
            }`}
          >
            {statusMap[status] || status}
          </span>
        )
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Сумма',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalAmount') as any)
        const formatted = new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
        }).format(amount)
        return <div className='font-medium'>{formatted}</div>
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Оплата',
      cell: ({ row }) => {
        const paymentMethod = row.getValue('paymentMethod') as string
        const paymentMethodMap: { [key: string]: string } = {
          cash_on_delivery: 'Наличными при получении',
          card_on_delivery: 'Картой при получении',
          b2b_invoice: 'Счет B2B',
        }
        const paymentMethodStyles: { [key: string]: string } = {
          cash_on_delivery: 'bg-emerald-100 text-emerald-700',
          card_on_delivery: 'bg-sky-100 text-sky-700',
          b2b_invoice: 'bg-amber-100 text-amber-700',
        }
        return (
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              paymentMethodStyles[paymentMethod] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {paymentMethodMap[paymentMethod] || paymentMethod}
          </span>
        )
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Статус оплаты',
      cell: ({ row }) => {
        const paymentStatus = row.getValue('paymentStatus') as string
        const paymentMap: { [key: string]: string } = {
          pending: 'Ожидание',
          paid: 'Оплачено',
          failed: 'Ошибка',
          refunded: 'Возврат',
        }
        return (
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              paymentStatus === 'paid'
                ? 'bg-green-100 text-green-700'
                : paymentStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {paymentMap[paymentStatus] || paymentStatus}
          </span>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const order = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Открыть меню</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Действия</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(order._id)}
              >
                Копировать ID заказа
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Изменить статус</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onStatusChange?.(order._id, 'confirmed')}
              >
                Подтвердить
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange?.(order._id, 'processing')}
              >
                В обработку
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange?.(order._id, 'shipping')}
              >
                Отправлено
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange?.(order._id, 'done')}
              >
                Завершить
              </DropdownMenuItem>
              <DropdownMenuItem
                className='text-red-600'
                onClick={() => onStatusChange?.(order._id, 'canceled')}
              >
                Отменить
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-red-600'
                onClick={() => onDeleteOrder?.(order._id)}
              >
                Удалить полностью
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
