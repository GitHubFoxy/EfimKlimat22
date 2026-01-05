import { SidebarProvider } from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { ManagerPageClient } from "./manager-page-client";

export default async function ManagerPage() {
  const itemsPreload = await preloadQuery(api.manager.list_items, {
    paginationOpts: { numItems: 24, cursor: null },
  });

  return (
    <SidebarProvider>
      <ManagerPageClient itemsPreload={itemsPreload} />
    </SidebarProvider>
  );
}
