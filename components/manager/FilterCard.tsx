'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FilterOption {
  id: string
  label: string
  options: Array<{ value: string; label: string }>
  value?: string
  onChange?: (value: string) => void
}

interface FilterCardProps {
  filters: FilterOption[]
  onReset?: () => void
}

export default function FilterCard({ filters, onReset }: FilterCardProps) {
  return (
    <div className='bg-white border border-yellow-100 rounded-lg p-4 mb-6 flex gap-4 items-end'>
      {filters.map((filter) => (
        <div key={filter.id}>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            {filter.label}
          </label>
          <Select
            value={filter.value}
            onValueChange={(value) => filter.onChange?.(value as string)}
          >
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='Select...' />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      {onReset && (
        <Button variant='outline' size='sm' onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  )
}
