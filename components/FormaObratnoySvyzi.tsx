'use client'

import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'

export const FormaObratnoySvyzi = () => {
  return (
    <Dialog>
      <form action='' onSubmit={(e) => e.preventDefault()}>
        <DialogTrigger asChild>
          <Button className='bg-amber-400 text-black font-normal text-lg cursor-pointer hover:bg-amber-500/30'>
            Консультация
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-center text-xl'>
              Бесплатная консультация
            </DialogTitle>
            <DialogDescription className='text-center'>
              Мы предлагаем широкий ассортимент климатического оборудования от
              ведущих брендов. Поможем создать комфортный климат в любом
              помещении.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4'>
            <div className='grid gap-3'>
              <Label htmlFor='name-1'>Имя</Label>
              <Input id='name-1' name='name' placeholder='Ваше имя' />
            </div>
            <div className='grid gap-3'>
              <Label htmlFor='phone-1'>Номер телефона</Label>
              <Input
                id='phone-1'
                name='phone'
                placeholder='Ваш номер телефона'
              />
            </div>
          </div>
          <DialogFooter className=''>
            <Button
              type='submit'
              className='cursor-pointer bg-amber-400 text-black hover:bg-amber-400/30'
            >
              Отправить
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
