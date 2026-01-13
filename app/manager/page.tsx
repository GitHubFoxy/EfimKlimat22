import { SidebarProvider } from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { ManagerPageClient } from "./manager-page-client";

export default async function ManagerPage() {
  const [itemsPreload, brandsPreload, categoriesPreload] = await Promise.all([
    preloadQuery(api.manager.list_items, {
      paginationOpts: { numItems: 24, cursor: null },
    }),
    preloadQuery(api.manager.list_brands_all),
    preloadQuery(api.manager.list_categories_all),
  ]);

  return (
    <SidebarProvider>
      <ManagerPageClient 
        itemsPreload={itemsPreload}
        brandsPreload={brandsPreload}
        categoriesPreload={categoriesPreload}
      />
    </SidebarProvider>
  );
}
