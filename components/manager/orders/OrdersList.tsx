import { Button } from '@/components/ui/button'
import EmptyState from '@/components/ui/EmptyState'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Id } from '@/convex/_generated/dataModel'

type Status = 'pending' | 'processing' | 'done'

export const ORDER_STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'pending', label: 'Ожидает' },
  { value: 'processing', label: 'В процессе' },
  { value: 'done', label: 'Готово' },
]

interface Order {
  _id: Id<'orders'>
  userId: Id<'users'>
  itemId: Id<'items'>[]
  total: number
  updatedAt?: number
  assignedManager?: Id<'users'>
  status: string
}

interface OrdersListProps {
  orders: Order[] | undefined
  managerId: string | null
  role: string | null
  updateStatus: (args: { orderId: Id<'orders'>; status: Status }) => void
  claim: (args: { orderId: Id<'orders'> }) => void
  unclaim: (args: { orderId: Id<'orders'> }) => void
  onResetStatus: () => void
}

export default function OrdersList({
  orders,
  managerId,
  role,
  updateStatus,
  claim,
  unclaim,
  onResetStatus,
}: OrdersListProps) {
  if ((orders?.length ?? 0) === 0) {
    return (
      <EmptyState
        title='Заказов нет'
        description='Нет заказов для текущего фильтра. Измените статус или проверьте позже.'
        secondaryActions={[
          {
            label: 'Изменить статус',
            onClick: onResetStatus,
          },
        ]}
      />
    )
  }

  return (
    <div className='space-y-3'>
      {orders!.map((o) => (
        <div
          key={o._id}
          className='border rounded p-3 flex flex-col md:flex-row md:items-center justify-between gap-4'
        >
          <div className='space-y-1'>
            <div className='text-sm text-muted-foreground'>
              Заказ ID: <span className='font-mono'>{o._id}</span>
            </div>
            <div className='text-sm'>
              Пользователь:{' '}
              <span className='font-mono'>{String(o.userId)}</span>
            </div>
            <div className='text-sm'>Товаров: {o.itemId.length}</div>
            <div className='text-sm'>Сумма: {o.total} ₽</div>
            <div className='text-xs text-muted-foreground'>
              Обновлено:{' '}
              {o.updatedAt ? new Date(o.updatedAt).toLocaleString() : '—'}
            </div>
            <div className='text-xs'>
              Назначен: {o.assignedManager ? String(o.assignedManager) : '—'}
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Select
              value={o.status as Status}
              onValueChange={(v) =>
                updateStatus({ orderId: o._id, status: v as Status })
              }
            >
              <SelectTrigger className='w-[140px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant='outline'
              onClick={() =>
                updateStatus({ orderId: o._id, status: 'processing' })
              }
            >
              Начать
            </Button>
            <Button
              onClick={() => updateStatus({ orderId: o._id, status: 'done' })}
            >
              Готово
            </Button>
            <Button
              variant='secondary'
              disabled={!managerId}
              onClick={() => managerId && claim({ orderId: o._id })}
            >
              Взять
            </Button>
            {(role === 'admin' ||
              (managerId &&
                o.assignedManager &&
                String(o.assignedManager) === managerId)) && (
              <Button
                variant='destructive'
                onClick={() => unclaim({ orderId: o._id })}
              >
                Снять
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
