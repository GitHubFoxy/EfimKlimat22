'use client'

import { useAuthActions, useAuthToken } from '@convex-dev/auth/react'
import { useQuery } from 'convex/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/convex/_generated/api'

export function SignInForm() {
  const { signIn } = useAuthActions()
  const token = useAuthToken()
  const isAuthenticated = token !== null
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const currentUser = useQuery(api.users.getCurrentUserWithTempPassword)
  const redirectTo = searchParams.get('redirect') || '/manager'

  useEffect(() => {
    if (isAuthenticated && currentUser !== undefined && currentUser !== null) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, currentUser, router, redirectTo])

  // Show nothing while authenticated user is being redirected
  if (isAuthenticated && currentUser !== undefined && currentUser !== null) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn('phone', {
        phone,
        password,
        flow: 'signIn',
      })
    } catch {
      setError('Неверный телефон или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <CardTitle>Вход</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='phone'>Телефон</Label>
            <Input
              id='phone'
              type='tel'
              placeholder='89999999999'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password'>Пароль</Label>
            <Input
              id='password'
              type='password'
              placeholder='Введите пароль'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className='text-sm text-destructive'>{error}</p>}
          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
