"use client";
import { useState, useRef } from "react";
import Stars from "./stars";
import { Button } from "./ui/button";
import { useCartSessionId } from "@/hooks/useCartSession";
import { Card, CardContent } from "./ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./ui/carousel";
import { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { Input } from "./ui/input";

// Helper to get specification summary
const getSpecificationSummary = (
  specifications?: Record<string, string | number | boolean>,
) => {
  if (!specifications) return "";

  // Try to find common specifications
  const power =
    specifications.power ||
    specifications.moshchnost ||
    specifications.capacity;
  if (power) return `${power}`;

  // Return first specification if available
  const keys = Object.keys(specifications);
  if (keys.length > 0) {
    const firstKey = keys[0];
    const value = specifications[firstKey];
    if (value !== undefined && value !== null) {
      return `${value}`;
    }
  }

  return "";
};

// Strong type for catalog item documents
type Item = Doc<"items"> & {
  // Compatibility fields for UI
  variantsCount?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  brand?: string;
  variant?: string;
  imagesUrls?: string[];
  collection?: string;
  sale?: number;
  // Added fields from queries
  brandName?: string;
};

export const ItemCard = ({ e }: { e: Item }) => {
  const [isHovered, setIsHovered] = useState(false);
  const sessionId = useCartSessionId();
  const addItem = useMutation(api.cart.addItem);
  const updateQty = useMutation(api.cart.updateQty);
  const removeItem = useMutation(api.cart.removeItem);
  const router = useRouter();

  // Get cart items to find current item (only if sessionId is available)
  const cartItems = useQuery(api.cart.listItems, sessionId ? { sessionId } : "skip");
  const cartItemData = cartItems ? cartItems.items?.find(
    (item) => item.itemId === e._id
  ) : undefined;

  // Debounce timer for quantity changes
  const debounceTimer = useRef<NodeJS.Timeout>();

  const onAdd = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!sessionId) return;
    try {
      await addItem({
        sessionId,
        itemId: e._id,
        quantity: 1,
      });

      toast.success("Товар добавлен в корзину", {
        description: `"${e.name}"`,
        action: {
          label: "Перейти в корзину",
          onClick: () => router.push("/checkout"),
        },
        duration: 4000,
      });
    } catch (err) {
      console.error("Failed to add to cart", err);
      toast.error("Ошибка", {
        description: "Не удалось добавить товар в корзину",
        duration: 6000,
      });
    }
  };

  const inc = (quantity: number) => {
    if (cartItemData) {
      updateQty({ cartItemId: cartItemData._id, quantity: quantity + 1 });
    }
  };

  const dec = (quantity: number) => {
    if (cartItemData) {
      updateQty({ cartItemId: cartItemData._id, quantity: quantity - 1 });
    }
  };

  const onQtyChange = (value: string) => {
    if (!cartItemData) return;
    const q = Math.max(0, Math.min(99, parseInt(value || "0", 10) || 0));
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      updateQty({ cartItemId: cartItemData._id, quantity: q });
    }, 300);
  };

  const href = `/catalog/${e.slug ?? ""}`;

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image + Carousel Section */}
      <Link href={href} className="block w-full">
        <div className="relative w-full h-[350px] flex items-center justify-center  transition-colors rounded-2xl overflow-hidden mb-3">
          {/* Add badge for multiple specifications */}
          {e.specifications && Object.keys(e.specifications).length > 0 && (
            <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md">
              {Object.keys(e.specifications).length} параметра
            </div>
          )}
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full">
              {(e.imagesUrl && e.imagesUrl.length > 0
                ? e.imagesUrl
                : ["/not-found.jpg"]
              ).map((img: string, index: number) => (
                <CarouselItem key={index}>
                  <div className="relative w-full h-[350px] flex items-center justify-center">
                    <Image
                      src={img ?? "/not-found.jpg"}
                      alt={e.name}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      unoptimized={!e.imagesUrl || e.imagesUrl.length === 0}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Carousel controls - only show when images exist and card is hovered */}
            {e.imagesUrl && e.imagesUrl.length > 0 && isHovered && (
              <div onClick={(e) => e.preventDefault()}>
                <CarouselPrevious className="left-2 transition-opacity" />
                <CarouselNext className="right-2 transition-opacity" />
              </div>
            )}
          </Carousel>
        </div>
      </Link>

      {/* Stars */}
      <div className="mb-2 flex justify-center">
        <Stars stars="0" />
      </div>

      {/* Name and Price on same line */}
      <Link href={href} className="block mb-3">
         <div className="flex flex-col justify-between items-start gap-3">
           <p className="text-base leading-6 line-clamp-2 h-12 overflow-hidden">
             {e.name}
             {getSpecificationSummary(e.specifications) &&
               ` ${getSpecificationSummary(e.specifications)}`}
           </p>
          <p className="font-medium whitespace-nowrap shrink-0 text-right">
            {e.priceRange ? (
              <>
                {formatPrice(e.priceRange.min)}
                {e.priceRange.min !== e.priceRange.max && (
                  <> - {formatPrice(e.priceRange.max)}</>
                )}
                {" руб."}
              </>
            ) : (
              <>{formatPrice(e.price)} руб.</>
            )}
          </p>
        </div>
      </Link>

      {/* Add to Cart Button or Quantity Controls */}
      {cartItemData ? (
        <div className="flex items-center justify-center gap-4 bg-orange-100 rounded-full h-14 px-4">
          <button
            onClick={() => dec(cartItemData.quantity)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-light-orange hover:bg-amber-500 transition-all hover:shadow-lg text-white font-bold text-2xl leading-none"
          >
            −
          </button>
          <Input
            type="number"
            value={cartItemData.quantity}
            className="w-16 h-10 p-0 text-center rounded-lg border-0 bg-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-light-orange"
            onChange={(e) => onQtyChange(e.target.value)}
            min="1"
            max="99"
          />
          <button
            onClick={() => inc(cartItemData.quantity)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-light-orange hover:bg-amber-500 transition-all hover:shadow-lg text-white font-bold text-2xl leading-none"
          >
            +
          </button>
        </div>
      ) : (
        <Button
          className="bg-light-orange w-full rounded-full h-14 cursor-pointer hover:bg-amber-500 transition-colors font-semibold text-base"
          onClick={onAdd}
          disabled={!sessionId}
        >
          В корзину
        </Button>
      )}
    </div>
  );
};

export default ItemCard;
