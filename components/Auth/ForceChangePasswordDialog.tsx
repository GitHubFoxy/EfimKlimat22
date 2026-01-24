'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ForceChangePasswordDialogProps {
  onSubmit: (newPassword: string) => Promise<void>
}

export function ForceChangePasswordDialog({
  onSubmit,
}: ForceChangePasswordDialogProps) {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (newPassword.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      return
    }

    setLoading(true)

    try {
      await onSubmit(newPassword)
      // Page will update after password change, no need to redirect
    } catch {
      setError('Не удалось изменить пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className='sm:max-w-sm' showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className='text-center'>Изменение пароля</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <p className='text-sm text-muted-foreground text-center'>
            Пожалуйста, измените ваш пароль перед использованием системы
          </p>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='newPassword'>Новый пароль</Label>
              <Input
                id='newPassword'
                type='password'
                placeholder='Введите новый пароль'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Подтвердите пароль</Label>
              <Input
                id='confirmPassword'
                type='password'
                placeholder='Подтвердите пароль'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <p className='text-sm text-destructive text-center'>{error}</p>
            )}
            <Button
              type='submit'
              className='w-full'
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? 'Сохранение...' : 'Сохранить пароль'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
