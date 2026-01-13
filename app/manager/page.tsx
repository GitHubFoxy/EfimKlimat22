import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ManagerPageWrapper } from "./manager-page-wrapper";

export default async function ManagerPage() {
  const [itemsPreload, brandsPreload, categoriesPreload] = await Promise.all([
    preloadQuery(api.manager.list_items, {
      paginationOpts: { numItems: 24, cursor: null },
    }),
    preloadQuery(api.manager.list_brands_all),
    preloadQuery(api.manager.list_categories_all),
  ]);

  return (
    <SidebarProvider suppressHydrationWarning>
      <ManagerPageWrapper
        itemsPreload={itemsPreload}
        brandsPreload={brandsPreload}
        categoriesPreload={categoriesPreload}
      />
    </SidebarProvider>
  );
}
