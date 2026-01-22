'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ChangePasswordFormProps {
  onSubmit: (newValue: string) => Promise<void>
}

export function ChangePasswordForm({ onSubmit }: ChangePasswordFormProps) {
  const router = useRouter()
  const [newValue, setNewValue] = useState('')
  const [confirmValue, setConfirmValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newValue !== confirmValue) {
      setError('Пароли не совпадают')
      return
    }

    if (newValue.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      return
    }

    setLoading(true)

    try {
      await onSubmit(newValue)
      router.push('/manager')
    } catch {
      setError('Не удалось изменить пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <CardTitle>Смена пароля</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='newValue'>Новый пароль</Label>
            <Input
              id='newValue'
              type='password'
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='confirmValue'>Подтвердите пароль</Label>
            <Input
              id='confirmValue'
              type='password'
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              required
            />
          </div>
          {error && <p className='text-sm text-destructive'>{error}</p>}
          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
