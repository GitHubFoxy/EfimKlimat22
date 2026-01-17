import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { OrderClient } from "./OrderClient";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const preloadedOrder = await preloadQuery(api.orders.get_order_by_id, {
    id: id as Id<"orders">,
  });

  return <OrderClient preloadedOrder={preloadedOrder} />;
}
