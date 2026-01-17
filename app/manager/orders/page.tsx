import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { OrdersPageClient } from "./orders-page-client";

interface OrdersPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const cursor = (params.cursor as string) ?? null;

  const ordersPreload = await preloadQuery(api.manager.list_orders, {
    paginationOpts: { numItems: 24, cursor },
  });

  return (
    <SidebarProvider suppressHydrationWarning>
      <OrdersPageClient
        ordersPreload={ordersPreload}
        initialParams={{ cursor }}
      />
    </SidebarProvider>
  );
}
