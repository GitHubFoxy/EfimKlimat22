"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, BoxesIcon, Users } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type Section = "orders" | "items" | "leads";

interface AppSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: Section) => void;
}

const items = [
  {
    title: "Товары",
    id: "items",
    icon: BoxesIcon,
  },
  {
    title: "Лиды",
    id: "leads",
    icon: Users,
  },
  {
    title: "Заказы",
    id: "orders",
    icon: ShoppingCart,
  },
];

export function AppSidebar({
  activeSection = "orders",
  onSectionChange,
}: AppSidebarProps) {
  return (
    <Sidebar className="border-r">
      <SidebarHeader>
        <Link href="/">
          <div className="flex items-center gap-2 px-2 cursor-pointer hover:opacity-80 transition-opacity">
            <Image src="/logo_.jpg" alt="Logo" width={48} height={48} className="w-12 h-12 object-contain" />
            <span className="font-medium text-sm">Климат22</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-gray-500 uppercase tracking-wide">
            Меню
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange?.(item.id as Section)}
                    className={`text-gray-600 hover:bg-gray-100 cursor-pointer ${
                      activeSection === item.id
                        ? "bg-gray-100 text-gray-900"
                        : ""
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
