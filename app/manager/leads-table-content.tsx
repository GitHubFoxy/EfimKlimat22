"use client";

import { useState } from "react";
import { DataTable } from "./data-table";
import { useRouter, useSearchParams } from "next/navigation";
import { leadColumns, type Lead } from "./columns";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function LeadsTableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cursor, setCursor] = useState<string | null>(
    (searchParams.get("cursor") as string) ?? null,
  );

  // URL sync utilities
  const updateParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    }
    const search = newParams.toString();
    router.replace(`/manager/leads${search ? `?${search}` : ""}`, {
      scroll: false,
    });
  };

  // Fetch leads data with pagination
  const leadsData = useQuery(api.manager.list_leads, {
    paginationOpts: { numItems: 24, cursor },
  });

  if (!leadsData) {
    return (
      <div className="p-4 text-center text-gray-500">Загрузка лидов...</div>
    );
  }

  if (!leadsData.page || leadsData.page.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Лиды не найдены в базе данных
      </div>
    );
  }

  // Transform Convex lead data to match Lead interface
  const transformedLeads: Lead[] = leadsData.page.map((lead: any) => ({
    _id: lead._id,
    name: lead.name || "Unknown",
    email: lead.email,
    phone: lead.phone || "Unknown",
    type: lead.type || "callback",
    status: lead.status || "new",
    message: lead.message,
    updatedAt: lead.updatedAt || 0,
  }));

  const handleNextPage = () => {
    if (leadsData.continueCursor) {
      updateParams({ cursor: leadsData.continueCursor });
      setCursor(leadsData.continueCursor);
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousPage = () => {
    updateParams({ cursor: null });
    setCursor(null);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <div className="text-sm text-gray-600 mb-4">
        Показано {leadsData.page.length} лидов
      </div>
      <DataTable columns={leadColumns} data={transformedLeads} />

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={cursor === null}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Предыдущая
        </Button>

        <span className="text-sm text-gray-600">
          {cursor ? "Страница 2+" : "Страница 1"}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={leadsData.isDone}
        >
          Следующая
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </>
  );
}
