"use client";

import { useState } from "react";
import { DataTable } from "./data-table";
import { itemColumns, type Item } from "./columns";
import { useQuery, usePreloadedQuery, Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ItemsTableContentProps {
  itemsPreload: Preloaded<typeof api.manager.list_items>;
}

export function ItemsTableContent({ itemsPreload }: ItemsTableContentProps) {
  const [cursor, setCursor] = useState<string | null>(null);
  
  // Use preloaded query on initial page load
  const itemsDataPreloaded = usePreloadedQuery(itemsPreload);
  
  // When navigating pages, fetch new data
  const itemsDataQuery = useQuery(api.manager.list_items, {
    paginationOpts: { numItems: 24, cursor },
  });
  
  const itemsData = cursor !== null ? itemsDataQuery : itemsDataPreloaded;

  if (!itemsData) {
    return <div className="p-4 text-center text-gray-500">No items found in database</div>;
  }

  if (!itemsData.page || itemsData.page.length === 0) {
    return <div className="p-4 text-center text-gray-500">No items found in database</div>;
  }

  // Transform Convex item data to match Item interface
  const transformedItems: (Item & { sku?: string; brandId?: string })[] = itemsData.page.map((item: any) => ({
    _id: item._id,
    name: item.name || "Unknown",
    brand: "Unknown", // Placeholder - will be resolved via query
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
      <div className="text-sm text-gray-600 mb-4">Showing {itemsData.page.length} items</div>
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
          Previous
        </Button>
        
        <span className="text-sm text-gray-600">
          {cursor ? "Page 2+" : "Page 1"}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={itemsData.isDone}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </>
  );
}
