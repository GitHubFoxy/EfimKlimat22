'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '../ui/button'

export const Hero = () => {
  return (
    <main className='grid grid-cols-1 md:grid-cols-5 gap-4 '>
      <div className='flex flex-col gap-4 p-6 md:px-9 bg-light-gray rounded-[30px] md:col-span-3 md:gap-9'>
        <div className='flex flex-col gap-2 md:pt-[72px] md:gap-[24px]'>
          <h1 className='text-base font-medium w-[25ch] md:text-4xl'>
            Широкий ассортимент климатического оборудования
          </h1>
          <h2 className='md:text-2xl'>
            Поможем создать комфортный климат в любом помещении
          </h2>
        </div>

        <div className='flex flex-col gap-2  md:flex-row md:w-full'>
          <Button
            render={<Link href={'/catalog'} />}
            className='bg-light-orange h-[36px] rounded-full md:h-[57px]'
          >
            Выбрать товары
          </Button>
          <Button
            render={
              <Link
                href='#free-consultant'
                onClick={(e) => {
                  e.preventDefault()
                  const el = document.getElementById('free-consultant')
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    history.replaceState(null, '', '#free-consultant')
                  }
                }}
              />
            }
            className='cursor-pointer bg-transparent border border-blackish h-[36px] rounded-full md:h-[57px]'
            variant={'outline'}
          >
            Заказать консультацию
          </Button>
        </div>
      </div>
      <div className='relative w-full h-[200px] md:h-[429px] object-cover md:col-span-2'>
        <Image
          className='z-0'
          src={'/hero.jpg'}
          alt='Большой выбор материалов, Более 20 лет на рынке, Доставка по барнаулу'
          fill={true}
          loading='eager'
          priority
        />
      </div>
    </main>
  )
}
