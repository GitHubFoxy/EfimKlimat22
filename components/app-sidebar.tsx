'use client'

import { BoxesIcon, ShoppingCart, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserProfileSidebar } from '@/components/UserProfileSidebar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const items = [
  {
    title: 'Товары',
    href: '/manager/items',
    icon: BoxesIcon,
  },
  {
    title: 'Лиды',
    href: '/manager/leads',
    icon: Users,
  },
  {
    title: 'Заказы',
    href: '/manager/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Пользователи',
    href: '/manager/users',
    icon: Users,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className='border-r'>
      <SidebarHeader>
        <Link href='/'>
          <div className='flex items-center gap-2 px-2 cursor-pointer hover:opacity-80 transition-opacity'>
            <Image
              src='/logo_.jpg'
              alt='Logo'
              width={48}
              height={48}
              className='w-12 h-12 object-contain'
            />
            <span className='font-medium text-sm'>Климат22</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className='text-xs text-gray-500 uppercase tracking-wide'>
            Меню
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      className={`text-gray-600 hover:bg-gray-100 cursor-pointer ${
                        pathname === item.href
                          ? 'bg-gray-100 text-gray-900'
                          : ''
                      }`}
                    >
                      <item.icon className='w-4 h-4' />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserProfileSidebar />
      </SidebarFooter>
    </Sidebar>
  )
}
