"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Download, Plus, Search } from "lucide-react";
import { ItemsTableContent } from "./items-table-content";
import { LeadsTableContent } from "./leads-table-content";
import { OrdersTableContent } from "./orders-table-content";



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

                {/* Orders Table */}
                <OrdersTableContent />
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

                {/* Leads Table */}
                <LeadsTableContent />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
