import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LeadsPageClient } from "./leads-page-client";

interface LeadsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams;
  const cursor = (params.cursor as string) ?? null;

  const leadsPreload = await preloadQuery(api.manager.list_leads, {
    paginationOpts: { numItems: 24, cursor },
  });

  return (
    <SidebarProvider suppressHydrationWarning>
      <LeadsPageClient leadsPreload={leadsPreload} initialParams={{ cursor }} />
    </SidebarProvider>
  );
}
