'use client'

import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
}: StatsCardProps) {
  return (
    <Card className='bg-yellow-50 border-yellow-200'>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between'>
          <div>
            <p className='text-gray-600 text-sm mb-2'>{title}</p>
            <h3 className='text-3xl font-bold text-gray-900'>{value}</h3>
          </div>
          <Icon className='w-8 h-8 text-yellow-600' />
        </div>
      </CardContent>
    </Card>
  )
}
