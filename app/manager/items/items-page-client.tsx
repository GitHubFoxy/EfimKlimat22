"use client";

import { useState, useEffect } from "react";
import { usePreloadedQuery, Preloaded } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { ItemsTableContent } from "../items-table-content";
import { ItemFormDialog } from "../item-form-dialog";
import { DeleteItemDialog } from "../delete-item-dialog";
import type { Id } from "@/convex/_generated/dataModel";

type SortBy = "name" | "price" | "quantity" | "ordersCount" | "createdAt";
type SortOrder = "asc" | "desc";
type ItemStatus = "active" | "draft" | "preorder";

interface ItemsPageClientProps {
  itemsPreload: Preloaded<typeof api.manager.list_items>;
  brandsPreload: Preloaded<typeof api.manager.list_brands_all>;
  categoriesPreload: Preloaded<typeof api.manager.list_categories_all>;
  initialParams: {
    cursor: string | null;
    brandId: string | null;
    categoryId: string | null;
    status: string | null;
    sortBy: string;
    sortOrder: string;
  };
}

export function ItemsPageClient({
  itemsPreload,
  brandsPreload,
  categoriesPreload,
  initialParams,
}: ItemsPageClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [localDebouncedSearch, setLocalDebouncedSearch] = useState("");

  // Dialog state for create/edit items
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Dialog state for delete item
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<any | null>(null);
  const [deletingItemName, setDeletingItemName] = useState<string>("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset cursor when debounced search changes
  useEffect(() => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.delete("cursor");
    const search = newParams.toString();
    router.replace(`/manager/items${search ? `?${search}` : ""}`, {
      scroll: false,
    });
  }, [localDebouncedSearch, router]);

  const openCreateDialog = () => {
    setEditingItem(null);
    setIsItemDialogOpen(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setIsItemDialogOpen(true);
  };

  const handleDeleteItem = (id: any, name: string) => {
    setDeletingItemId(id);
    setDeletingItemName(name);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="border-b-2 bg-white">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold text-gray-900">Товары</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-gray-900 hover:bg-gray-800 text-white"
                onClick={openCreateDialog}
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить
              </Button>
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
                  placeholder="Поиск товаров..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Items Table */}
            <ItemsTableContent
              itemsPreload={itemsPreload}
              searchQuery={localDebouncedSearch}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
            />
          </div>
        </main>
      </div>

      {/* Item Form Dialog (Create / Edit) */}
      <ItemFormDialog
        isOpen={isItemDialogOpen}
        onClose={() => {
          setIsItemDialogOpen(false);
          setEditingItem(null);
        }}
        item={editingItem ?? undefined}
        brandsPreload={brandsPreload}
        categoriesPreload={categoriesPreload}
      />

      {/* Delete Item Dialog */}
      <DeleteItemDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingItemId(null);
          setDeletingItemName("");
        }}
        itemId={deletingItemId}
        itemName={deletingItemName}
      />
    </div>
  );
}
