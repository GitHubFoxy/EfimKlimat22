'use client'

import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ContentHeaderProps {
  title: string
  subtitle?: string
  onSearchChange?: (value: string) => void
  actionButtons?: Array<{
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }>
}

export default function ContentHeader({
  title,
  subtitle,
  onSearchChange,
  actionButtons,
}: ContentHeaderProps) {
  return (
    <div className='border-b border-yellow-100 bg-white px-8 py-6'>
      <h2 className='text-3xl font-bold text-gray-900 mb-2'>{title}</h2>
      {subtitle && <p className='text-gray-600 text-sm mb-6'>{subtitle}</p>}

      <div className='flex items-center gap-4'>
        <div className='flex-1 max-w-sm relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
          <Input
            type='text'
            placeholder='Search...'
            onChange={(e) => onSearchChange?.(e.target.value)}
            className='pl-10'
          />
        </div>

        {actionButtons && actionButtons.length > 0 && (
          <div className='flex gap-2'>
            {actionButtons.map((btn, idx) => (
              <Button
                key={idx}
                onClick={btn.onClick}
                className='bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium'
              >
                {btn.icon && <span className='mr-2'>{btn.icon}</span>}
                {btn.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
