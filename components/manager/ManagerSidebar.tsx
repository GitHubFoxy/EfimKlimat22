"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BoxesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ManagerSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function ManagerSidebar({
  activeSection = "dashboard",
  onSectionChange,
}: ManagerSidebarProps) {
  const items = [
    { name: "Items", icon: BoxesIcon, id: "items" },
    { name: "Leads", icon: Users, id: "leads" },
    { name: "Orders", icon: ShoppingCart, id: "orders" },
    { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  ];

  return (
    <aside className="w-60 bg-yellow-50 border-r border-yellow-200 min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Image src="/logo_.jpg" alt="Logo" width={48} height={48} className="w-12 h-12 object-contain" />
          <h1 className="text-2xl font-bold text-gray-900">Климат22</h1>
        </div>
        <p className="text-sm text-gray-600">Manager</p>
      </div>

      <nav className="space-y-2 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              onClick={() => onSectionChange?.(item.id)}
              variant={activeSection === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                activeSection === item.id && "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
