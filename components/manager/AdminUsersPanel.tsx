import { Label } from '@radix-ui/react-label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@radix-ui/react-select'
import { useAction, useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import { api } from '@/convex/_generated/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export default function AdminUsersPanel() {
  const createUser = useAction(api.users.create_user_with_role)
  const updateUser = useMutation(api.users.update_user)
  const deleteUser = useMutation(api.users.delete_user)
  const [roleFilter, setRoleFilter] = useState<'user' | 'manager' | 'admin'>(
    'manager',
  )
  const users = useQuery(api.users.list_users_by_role, { role: roleFilter })

  const [newUser, setNewUser] = useState({
    name: '',
    phone: '',
    role: 'manager' as 'user' | 'manager' | 'admin',
  })
  const [edits, setEdits] = useState<
    Record<
      string,
      { name: string; phone: string; role: 'user' | 'manager' | 'admin' }
    >
  >({})

  const getEditUser = (u: any) =>
    edits[String(u._id)] ?? { name: u.name, phone: u.phone, role: u.role }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
        <div className='space-y-1'>
          <Label htmlFor='newUserName'>Имя</Label>
          <Input
            id='newUserName'
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
        </div>
        <div className='space-y-1'>
          <Label htmlFor='newUserPhone'>Телефон</Label>
          <Input
            id='newUserPhone'
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
          />
        </div>
        <div className='space-y-1'>
          <Label>Роль</Label>
          <Select
            value={newUser.role}
            onValueChange={(v: any) => setNewUser({ ...newUser, role: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='user'>user</SelectItem>
              <SelectItem value='manager'>manager</SelectItem>
              <SelectItem value='admin'>admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Button
          onClick={async () => {
            await createUser({
              name: newUser.name,
              phone: newUser.phone,
              role: newUser.role,
            })
            setNewUser({ name: '', phone: '', role: newUser.role })
          }}
        >
          Создать пользователя
        </Button>
      </div>

      <div className='flex items-center gap-4'>
        <Label>Фильтр по роли:</Label>
        <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='user'>user</SelectItem>
            <SelectItem value='manager'>manager</SelectItem>
            <SelectItem value='admin'>admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-3 mt-3'>
        {users?.map((u) => (
          <div key={u._id} className='border rounded p-3 space-y-2'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              <div className='space-y-1'>
                <Label>Имя</Label>
                <Input
                  value={getEditUser(u).name}
                  onChange={(e) =>
                    setEdits((prev) => ({
                      ...prev,
                      [String(u._id)]: {
                        ...getEditUser(u),
                        name: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className='space-y-1'>
                <Label>Телефон</Label>
                <Input
                  value={getEditUser(u).phone}
                  onChange={(e) =>
                    setEdits((prev) => ({
                      ...prev,
                      [String(u._id)]: {
                        ...getEditUser(u),
                        phone: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className='space-y-1'>
                <Label>Роль</Label>
                <Select
                  value={getEditUser(u).role}
                  onValueChange={(v: any) =>
                    setEdits((prev) => ({
                      ...prev,
                      [String(u._id)]: { ...getEditUser(u), role: v },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='user'>user</SelectItem>
                    <SelectItem value='manager'>manager</SelectItem>
                    <SelectItem value='admin'>admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                variant='secondary'
                onClick={async () => {
                  const ed = getEditUser(u)
                  await updateUser({
                    id: u._id,
                    name: ed.name,
                    phone: ed.phone,
                    role: ed.role,
                  })
                  setEdits((prev) => {
                    const next = { ...prev }
                    delete next[String(u._id)]
                    return next
                  })
                }}
              >
                Сохранить
              </Button>
              <Button
                variant='outline'
                onClick={() =>
                  setEdits((prev) => {
                    const next = { ...prev }
                    delete next[String(u._id)]
                    return next
                  })
                }
              >
                Сброс
              </Button>
              <Button
                variant='destructive'
                onClick={() => deleteUser({ id: u._id })}
              >
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
