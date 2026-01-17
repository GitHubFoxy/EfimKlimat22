"use client";

import { useState, useEffect } from "react";
import { useQuery, usePreloadedQuery, Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { DataTable } from "./data-table";
import { getItemColumns, type Item } from "./columns";
import { ItemsFilterBar } from "./items-filter-bar";
import type { Id } from "@/convex/_generated/dataModel";

type SortBy = "name" | "price" | "quantity" | "ordersCount" | "createdAt";
type SortOrder = "asc" | "desc";
type ItemStatus = "active" | "draft" | "preorder";

interface ItemsTableContentProps {
  itemsPreload: Preloaded<typeof api.manager.list_items>;
  searchQuery?: string;
  onEditItem?: (item: any) => void;
  onDeleteItem?: (id: any, name: string) => void;
}

export function ItemsTableContent({
  itemsPreload,
  searchQuery = "",
  onEditItem,
  onDeleteItem,
}: ItemsTableContentProps) {
  const [cursor, setCursor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);

  // Filter state
  const [brandId, setBrandId] = useState<Id<"brands"> | undefined>();
  const [categoryId, setCategoryId] = useState<Id<"categories"> | undefined>();
  const [status, setStatus] = useState<ItemStatus | undefined>();

  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setCursor(null);
  }

  const handleSortChange = (newSortBy: SortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
    setCursor(null);
  };

  // Reset cursor when filters change
  const handleFilterChange = () => {
    setCursor(null);
  };

  const handleClearFilters = () => {
    setBrandId(undefined);
    setCategoryId(undefined);
    setStatus(undefined);
    setCursor(null);
  };

  // Use preloaded query on initial page load
  const itemsDataPreloaded = usePreloadedQuery(itemsPreload);

  const normalizedSearch = searchQuery.trim();
  const isSearching = normalizedSearch.length > 0;

  // Build query arguments - only include filter params if they have values
  const queryArgs: any = {
    paginationOpts: { numItems: 24, cursor },
    sortBy,
    sortOrder,
  };
  if (brandId !== undefined) queryArgs.brandId = brandId;
  if (categoryId !== undefined) queryArgs.categoryId = categoryId;
  if (status !== undefined) queryArgs.status = status;

  // Fetch items reactively (so list updates after mutations)
  const searchArgs = {
    ...queryArgs,
    query: normalizedSearch,
  };
  const itemsDataQuery = useQuery(
    isSearching ? api.manager.search_items : api.manager.list_items,
    isSearching ? searchArgs : queryArgs,
  );

  const isDefaultQuery =
    !isSearching &&
    brandId === undefined &&
    categoryId === undefined &&
    status === undefined &&
    cursor === null &&
    sortBy === "createdAt" &&
    sortOrder === "desc";

  // Prefer reactive query, fallback to preloaded for initial render
  const itemsData =
    itemsDataQuery ?? (isDefaultQuery ? itemsDataPreloaded : undefined);

  const handleNextPage = () => {
    if (itemsData?.continueCursor) {
      setCursor(itemsData.continueCursor);
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousPage = () => {
    setCursor(null);
    window.scrollTo(0, 0);
  };

  const columns = getItemColumns({
    onEdit: (item: any) => {
      if (onEditItem) onEditItem(item);
    },
    onDelete: (id: any, name: string) => {
      if (onDeleteItem) onDeleteItem(id, name);
    },
  });

  return (
    <>
      {/* Filter Bar - ALWAYS RENDER */}
      <ItemsFilterBar
        brandId={brandId}
        categoryId={categoryId}
        status={status}
        onBrandChange={(id) => {
          setBrandId(id);
          handleFilterChange();
        }}
        onCategoryChange={(id) => {
          setCategoryId(id);
          handleFilterChange();
        }}
        onStatusChange={(s) => {
          setStatus(s);
          handleFilterChange();
        }}
        onClearFilters={handleClearFilters}
      />

      {!itemsData && (
        <div className="p-4 text-center text-gray-500">Загрузка...</div>
      )}

      {itemsData && (!itemsData.page || itemsData.page.length === 0) && (
        <div className="p-4 text-center text-gray-500">
          Товары не найдены в базе данных
        </div>
      )}

      {itemsData &&
        itemsData.page &&
        itemsData.page.length > 0 &&
        (() => {
          const transformedItems: (Item & {
            sku?: string;
            brandId?: string;
            [k: string]: any;
          })[] = itemsData.page.map((item: any) => ({
            ...item,
            _id: item._id,
            name: item.name || "Unknown",
            brand: item.brandName || item.brand || "Unknown",
            quantity: item.quantity || 0,
            price: item.price || 0,
          }));

          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  Показано {itemsData.page.length} товаров
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Сортировка:</span>
                  <Select
                    value={sortBy}
                    onValueChange={(v) => handleSortChange(v as SortBy)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">По дате</SelectItem>
                      <SelectItem value="name">По названию</SelectItem>
                      <SelectItem value="price">По цене</SelectItem>
                      <SelectItem value="quantity">По количеству</SelectItem>
                      <SelectItem value="ordersCount">По заказам</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                  >
                    <ArrowUpDown className="w-4 h-4 mr-1" />
                    {sortOrder === "asc" ? "По возрастанию" : "По убыванию"}
                  </Button>
                </div>
              </div>
              <DataTable columns={columns} data={transformedItems} />

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
        })()}
    </>
  );
}
