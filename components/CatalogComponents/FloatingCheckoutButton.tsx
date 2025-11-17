"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCartSessionId } from "@/hooks/useCartSession";
import { formatPrice } from "@/lib/utils";

export default function FloatingCheckoutButton() {
  const router = useRouter();
  const sessionId = useCartSessionId();
  const itemsData = useQuery(api.cart.listItems, { sessionId });

  if (!itemsData || itemsData.count === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={() => router.push("/checkout")}
        className="bg-light-orange hover:bg-amber-500 rounded-full h-14 px-6 shadow-lg flex items-center gap-3"
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="font-medium">Оформить заказ</span>
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
          {formatPrice(itemsData.subtotal)} ₽
        </span>
      </Button>
    </div>
  );
}
