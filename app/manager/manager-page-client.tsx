"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DataTable } from "./data-table";
import { columns, itemColumns, type Order, type Item } from "./columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Download, Plus, Search } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ItemsTableContent } from "./items-table-content";

// Mock data
const mockOrders: Order[] = [
  {
    _id: "1",
    name: "John Doe",
    email: "john@example.com",
    status: "new",
    value: 1200,
    createdAt: "2025-01-05",
  },
  {
    _id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    status: "processing",
    value: 5000,
    createdAt: "2025-01-04",
  },
  {
    _id: "3",
    name: "Bob Wilson",
    email: "bob@example.com",
    status: "completed",
    value: 300,
    createdAt: "2025-01-03",
  },
  {
    _id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    status: "new",
    value: 2400,
    createdAt: "2025-01-02",
  },
  {
    _id: "5",
    name: "Charlie Davis",
    email: "charlie@example.com",
    status: "completed",
    value: 8900,
    createdAt: "2025-01-01",
  },
];

const mockItems: Item[] = [
  {
    _id: "i1",
    name: "Klimatyzator Ścienny",
    brand: "LG",
    quantity: 45,
    price: 2500,
  },
  {
    _id: "i2",
    name: "Pompa Ciepła",
    brand: "Daikin",
    quantity: 8,
    price: 15000,
  },
  {
    _id: "i3",
    name: "Filtr Powietrza",
    brand: "Philips",
    quantity: 0,
    price: 450,
  },
  {
    _id: "i4",
    name: "Instalacja Klimatyzacji",
    brand: "Fujitsu",
    quantity: 120,
    price: 3200,
  },
];

type Lead = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "new" | "contacted" | "qualified" | "lost";
  createdAt: string;
};

const mockLeads: Lead[] = [
  {
    _id: "l1",
    name: "Robert Kowalski",
    email: "robert@example.com",
    phone: "+48 123 456 789",
    company: "Tech Corp",
    status: "new",
    createdAt: "2025-01-05",
  },
  {
    _id: "l2",
    name: "Anna Nowak",
    email: "anna@example.com",
    phone: "+48 234 567 890",
    company: "Building Solutions",
    status: "contacted",
    createdAt: "2025-01-04",
  },
  {
    _id: "l3",
    name: "Piotr Lewandowski",
    email: "piotr@example.com",
    phone: "+48 345 678 901",
    company: "Home Services Ltd",
    status: "qualified",
    createdAt: "2025-01-03",
  },
  {
    _id: "l4",
    name: "Maria Wiśniewski",
    email: "maria@example.com",
    phone: "+48 456 789 012",
    company: "Industrial Group",
    status: "lost",
    createdAt: "2025-01-02",
  },
];

type Section = "orders" | "items" | "leads";

interface ManagerPageClientProps {
  itemsPreload: any;
}

export function ManagerPageClient({ itemsPreload }: ManagerPageClientProps) {
  const [activeSection, setActiveSection] = useState<Section>("items");
  const [searchQuery, setSearchQuery] = useState("");

  const getTitle = () => {
    switch (activeSection) {
      case "orders":
        return "Заказы";
      case "items":
        return "Товары";
      case "leads":
        return "Лиды";
      default:
        return "Менеджер";
    }
  };

  return (
    <>
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="border-b-2 bg-white">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold text-gray-900">
                {getTitle()}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Экспорт
              </Button>
              <Button
                size="sm"
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Tabs
            value={activeSection}
            onValueChange={(val) => setActiveSection(val as Section)}
            className="w-full"
          >
            {/* Orders Tab */}
            <TabsContent value="orders" className="p-8">
              <div className="space-y-6">
                {/* Search & Filters */}
                <div className="flex gap-4">
                  <div className="flex-1 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Поиск заказов..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Order Status Tabs */}
                <div className="flex gap-2 mb-2">
                  <button className="px-3 py-1.5 text-sm font-medium rounded bg-gray-900 text-white">
                    Все
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium rounded text-gray-600 hover:bg-gray-100">
                    Новые
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium rounded text-gray-600 hover:bg-gray-100">
                    В обработке
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium rounded text-gray-600 hover:bg-gray-100">
                    Завершенные
                  </button>
                </div>

                {/* Orders Table */}
                <DataTable columns={columns} data={mockOrders} />
              </div>
            </TabsContent>

            {/* Items Tab */}
            <TabsContent value="items" className="p-8">
              <div className="space-y-6">
                {/* Search & Filters */}
                <div className="flex gap-4">
                  <div className="flex-1 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Поиск товаров..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Items Table */}
                <ItemsTableContent itemsPreload={itemsPreload} />
              </div>
            </TabsContent>

            {/* Leads Tab */}
            <TabsContent value="leads" className="p-8">
              <div className="space-y-6">
                {/* Search & Filters */}
                <div className="flex gap-4">
                  <div className="flex-1 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Поиск лидов..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Lead Status Tabs */}
                <div className="flex gap-2 mb-2">
                  <button className="px-3 py-1.5 text-sm font-medium rounded bg-gray-900 text-white">
                    Все
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium rounded text-gray-600 hover:bg-gray-100">
                    Новые
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium rounded text-gray-600 hover:bg-gray-100">
                    Связались
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium rounded text-gray-600 hover:bg-gray-100">
                    Квалифицированные
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium rounded text-gray-600 hover:bg-gray-100">
                    Потерянные
                  </button>
                </div>

                {/* Leads Table */}
                <DataTable columns={columns} data={mockLeads as any} />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
