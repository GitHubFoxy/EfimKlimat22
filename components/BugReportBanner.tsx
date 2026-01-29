'use client'

import { X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function BugReportBanner() {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  return (
    <div className='sticky top-0 z-40 w-full bg-amber-50 border-b border-amber-200'>
      <div className='max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 sm:px-6'>
        <div className='flex items-center gap-3 flex-1'>
          <div className='flex-shrink-0'>
            <span className='text-xl'>🐛</span>
          </div>
          <p className='text-sm text-amber-900'>
            Нашли ошибку? Помогите нам улучшить приложение, сообщив об этом.
          </p>
        </div>
        <div className='flex items-center gap-2 flex-shrink-0'>
          <Button
            variant='outline'
            size='sm'
            asChild
            className='text-amber-900 border-amber-300 hover:bg-amber-100'
          >
            <a
              href='https://t.me/beruseruko'
              target='_blank'
              rel='noopener noreferrer'
            >
              Сообщить об ошибке
            </a>
          </Button>
          <button
            onClick={() => setIsDismissed(true)}
            className='p-1 hover:bg-amber-100 rounded transition-colors'
            aria-label='Закрыть'
          >
            <X className='size-4 text-amber-900' />
          </button>
        </div>
      </div>
    </div>
  )
}
