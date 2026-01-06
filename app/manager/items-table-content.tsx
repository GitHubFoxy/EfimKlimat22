"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./data-table";
import { itemColumns, type Item } from "./columns";
import { useQuery, usePreloadedQuery, Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ItemsTableContentProps {
  itemsPreload: Preloaded<typeof api.manager.list_items>;
  searchQuery?: string;
}

export function ItemsTableContent({ itemsPreload, searchQuery = "" }: ItemsTableContentProps) {
  const [cursor, setCursor] = useState<string | null>(null);

  // Reset cursor when search query changes
  useEffect(() => {
    setCursor(null);
  }, [searchQuery]);

  // Use preloaded query on initial page load
  const itemsDataPreloaded = usePreloadedQuery(itemsPreload);

  // When navigating pages, fetch new data
  const itemsDataQuery = useQuery(api.manager.list_items, {
    paginationOpts: { numItems: 24, cursor },
  });

  // Search query
  const searchDataQuery = useQuery(api.manager.search_items, 
    searchQuery ? {
      query: searchQuery,
      paginationOpts: { numItems: 24, cursor },
    } : "skip"
  );

  const itemsData = searchQuery 
    ? searchDataQuery 
    : (cursor !== null ? itemsDataQuery : itemsDataPreloaded);

  if (!itemsData) {
    return (
      <div className="p-4 text-center text-gray-500">
        Загрузка...
      </div>
    );
  }

  if (!itemsData.page || itemsData.page.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Товары не найдены в базе данных
      </div>
    );
  }

  // Transform Convex item data to match Item interface
  const transformedItems: (Item & { sku?: string; brandId?: string })[] =
    itemsData.page.map((item: any) => ({
      _id: item._id,
      name: item.name || "Unknown",
      brand: item.brandName || item.brand || "Unknown",
      quantity: item.quantity || 0,
      price: item.price || 0,
      sku: item.sku,
      brandId: item.brandId,
    }));

  const handleNextPage = () => {
    if (itemsData.continueCursor) {
      setCursor(itemsData.continueCursor);
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousPage = () => {
    setCursor(null);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <div className="text-sm text-gray-600 mb-4">
        Показано {itemsData.page.length} товаров
      </div>
      <DataTable columns={itemColumns} data={transformedItems} />

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
          disabled={itemsData.isDone}
        >
          Следующая
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </>
  );
}
