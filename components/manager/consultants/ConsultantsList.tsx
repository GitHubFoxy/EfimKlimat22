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

type ConsultantStatus = 'new' | 'processing' | 'done'

export const CONSULTANT_STATUS_OPTIONS: {
  value: ConsultantStatus
  label: string
}[] = [
  { value: 'new', label: 'Ожидает' },
  { value: 'processing', label: 'В процессе' },
  { value: 'done', label: 'Готово' },
]

interface Consultant {
  _id: Id<'leads'>
  name: string
  phone: string
  message?: string
  updatedAt?: number
  assignedManager?: Id<'users'>
  status: string
}

interface ConsultantsListProps {
  consultants: Consultant[] | undefined
  managerId: string | null
  role: string | null
  updateStatus: (args: {
    consultantId: Id<'leads'>
    status: ConsultantStatus
  }) => void
  claim: (args: { consultantId: Id<'leads'>; managerId: Id<'users'> }) => void
  unclaim: (args: { consultantId: Id<'leads'> }) => void
  onResetStatus: () => void
}

export default function ConsultantsList({
  consultants,
  managerId,
  role,
  updateStatus,
  claim,
  unclaim,
  onResetStatus,
}: ConsultantsListProps) {
  if ((consultants?.length ?? 0) === 0) {
    return (
      <EmptyState
        title='Запросов на консультацию нет'
        description='Нет консультаций для текущего фильтра. Измените статус или проверьте позже.'
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
      {consultants!.map((c) => (
        <div
          key={c._id}
          className='border rounded p-3 flex flex-col md:flex-row md:items-center justify-between gap-4'
        >
          <div className='space-y-1'>
            <div className='text-sm'>Имя: {c.name}</div>
            <div className='text-sm'>Телефон: {c.phone}</div>
            {c.message && <div className='text-sm'>Сообщение: {c.message}</div>}
            <div className='text-xs text-muted-foreground'>
              Обновлено:{' '}
              {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : '—'}
            </div>
            <div className='text-xs'>
              Назначен: {c.assignedManager ? String(c.assignedManager) : '—'}
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Select
              value={c.status as ConsultantStatus}
              onValueChange={(v: ConsultantStatus) =>
                updateStatus({
                  consultantId: c._id,
                  status: v,
                })
              }
            >
              <SelectTrigger className='w-[140px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONSULTANT_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant='outline'
              onClick={() =>
                updateStatus({
                  consultantId: c._id,
                  status: 'processing',
                })
              }
            >
              Начать
            </Button>
            <Button
              onClick={() =>
                updateStatus({
                  consultantId: c._id,
                  status: 'done',
                })
              }
            >
              Готово
            </Button>
            <Button
              variant='secondary'
              disabled={!managerId}
              onClick={() =>
                managerId &&
                claim({
                  consultantId: c._id,
                  managerId: managerId as Id<'users'>,
                })
              }
            >
              Взять
            </Button>
            {(role === 'admin' ||
              (managerId &&
                c.assignedManager &&
                String(c.assignedManager) === managerId)) && (
              <Button
                variant='destructive'
                onClick={() => unclaim({ consultantId: c._id })}
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
