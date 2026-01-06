import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ItemClient } from "./ItemClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // If there's no id param, show not found
  if (!id) {
    notFound();
  }

  // Cast the route param to the Convex Id type
  const convexId = id as unknown as Id<"items">;

  // Preload item data on the server for better SEO and initial load performance
  const preloadedItem = await preloadQuery(api.catalog.show_item, {
    id: convexId,
  });

  return <ItemClient preloadedItem={preloadedItem} itemId={convexId} />;
}
