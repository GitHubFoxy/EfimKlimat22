"use client";

import { useState, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Download, Plus, Search } from "lucide-react";
import { ItemsTableContent } from "./items-table-content";
import { LeadsTableContent } from "./leads-table-content";
import { OrdersTableContent } from "./orders-table-content";
import { UsersTableContent } from "./users-table-content";
import { ItemFormDialog } from "./item-form-dialog";
import { UserFormDialog } from "./user-form-dialog";
import { DeleteItemDialog } from "./delete-item-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { ForceChangePasswordDialog } from "@/components/Auth/ForceChangePasswordDialog";
import { api } from "@/convex/_generated/api";


type Section = "orders" | "items" | "leads" | "users";

interface ManagerPageClientProps {
  itemsPreload: any;
  brandsPreload: any;
  categoriesPreload: any;
}

export function ManagerPageClient({ itemsPreload, brandsPreload, categoriesPreload }: ManagerPageClientProps) {
  const [activeSection, setActiveSection] = useState<Section>("items");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [hasChangedPassword, setHasChangedPassword] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUserWithTempPassword);
  const changePassword = useAction(api.users.changePassword);

  // Derive whether to show password change dialog
  const showPasswordChange = currentUser && currentUser.tempPassword && !hasChangedPassword;

  // Dialog state for create/edit items
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Dialog state for create/edit users
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Dialog state for delete item
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<any | null>(null);
  const [deletingItemName, setDeletingItemName] = useState<string>("");

  // Dialog state for delete user
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<any | null>(null);

  // Simple debounce implementation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getTitle = () => {
    switch (activeSection) {
      case "orders":
        return "Заказы";
      case "items":
        return "Товары";
      case "leads":
        return "Лиды";
      case "users":
        return "Пользователи";
      default:
        return "Менеджер";
    }
  };

  const openCreateDialog = () => {
    if (activeSection === "users") {
      setEditingUser(null);
      setIsUserDialogOpen(true);
    } else {
      setEditingItem(null);
      setIsItemDialogOpen(true);
    }
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

  const handleDeleteUser = (user: any) => {
    setDeletingUser(user);
    setIsDeleteUserDialogOpen(true);
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
                <ItemsTableContent 
                  itemsPreload={itemsPreload} 
                  searchQuery={activeSection === "items" ? debouncedSearch : ""}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItem}
                />
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

            {/* Users Tab */}
            <TabsContent value="users" className="p-8">
              <div className="space-y-6">
                {/* Search & Filters */}
                <div className="flex gap-4">
                  <div className="flex-1 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Поиск пользователей..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Users Table */}
                <UsersTableContent 
                  searchQuery={activeSection === "users" ? debouncedSearch : ""}
                  onEditUser={(user) => {
                    setEditingUser(user);
                    setIsUserDialogOpen(true);
                  }}
                  onDeleteUser={handleDeleteUser}
                />
              </div>
            </TabsContent>
          </Tabs>
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

      {/* User Form Dialog (Create / Edit) */}
      <UserFormDialog
        isOpen={isUserDialogOpen}
        onClose={() => {
          setIsUserDialogOpen(false);
          setEditingUser(null);
        }}
        user={editingUser ?? undefined}
      />

      {/* Delete Confirmation for Items */}
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

      {/* Delete Confirmation for Users */}
      <DeleteUserDialog
        isOpen={isDeleteUserDialogOpen}
        onClose={() => {
          setIsDeleteUserDialogOpen(false);
          setDeletingUser(null);
        }}
        userId={deletingUser?._id || null}
        userName={deletingUser?.name || ""}
      />

      {/* Force Change Password Dialog */}
      {showPasswordChange && (
        <ForceChangePasswordDialog
          onSubmit={async (newPassword) => {
            await changePassword({ newPassword });
            setHasChangedPassword(true);
          }}
        />
      )}
    </>
  );
}
