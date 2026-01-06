"use client";

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

interface AppSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
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
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
            <span className="text-white text-sm font-medium">E</span>
          </div>
          <span className="font-medium text-sm">EfimKlimat</span>
        </div>
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
                    onClick={() => onSectionChange?.(item.id)}
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
