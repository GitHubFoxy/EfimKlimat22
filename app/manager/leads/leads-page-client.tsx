"use client";

import { useState } from "react";
import { usePreloadedQuery, Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { LeadsTableContent } from "../leads-table-content";

interface LeadsPageClientProps {
  leadsPreload: Preloaded<typeof api.manager.list_leads>;
  initialParams: {
    cursor: string | null;
  };
}

export function LeadsPageClient({
  leadsPreload,
  initialParams,
}: LeadsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="border-b-2 bg-white">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold text-gray-900">Лиды</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-6">
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
        </main>
      </div>
    </div>
  );
}
