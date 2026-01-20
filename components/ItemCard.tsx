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
import { formatPrice, getRussianPlural } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

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

// Helper for Russian pluralization of "вариант/варианта/вариантов"
const getPluralVariants = (count: number): string => {
  if (count % 10 === 1 && count % 100 !== 11) {
    return "вариант";
  } else if (
    (count % 10 === 2 || count % 10 === 3 || count % 10 === 4) &&
    (count % 100 !== 12 && count % 100 !== 13 && count % 100 !== 14)
  ) {
    return "варианта";
  }
  return "вариантов";
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
   sale?: number;
   // Added fields from queries
   brandName?: string;
 };

interface ItemCardProps {
  e: Item;
  variantCount?: number;
}

export const ItemCard = ({ e, variantCount }: ItemCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const sessionId = useCartSessionId();
  const addItem = useMutation(api.cart.addItem);
  const updateQty = useMutation(api.cart.updateQty);
  const removeItem = useMutation(api.cart.removeItem);
  const router = useRouter();

  // Get cart items to find current item (only if sessionId is available)
  const cartItems = useQuery(
    api.cart.listItems,
    sessionId ? { sessionId } : "skip",
  );
  const cartItemData = cartItems
    ? cartItems.items?.find((item) => item.itemId === e._id)
    : undefined;

  // Debounce timer for quantity changes
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

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
           {/* Show variant count badge only if more than 1 item in family */}
            {variantCount && variantCount > 1 && (
              <div 
                className="absolute top-2 right-2 z-10 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md cursor-help"
                title="Количество вариантов этого товара в семействе"
              >
                {getRussianPlural(variantCount, "вариант", "варианта", "вариантов")}
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

      {/* Name and price section */}
      <Link href={href} className="block mb-3">
         <div className="flex flex-col items-start gap-2">
           {e.brandName && (
             <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
               {e.brandName}
             </p>
           )}
           <p className="text-base leading-6 line-clamp-2">
             {e.name}
             {getSpecificationSummary(e.specifications) &&
               ` ${getSpecificationSummary(e.specifications)}`}
           </p>
           <p className="font-medium mt-auto w-full text-right">
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
        <div className="flex items-center justify-between bg-light-orange text-white rounded-full h-14 px-2 w-full shadow-sm">
          <button
            onClick={(e) => {
              e.preventDefault();
              dec(cartItemData.quantity);
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
          >
            <Minus className="w-5 h-5 stroke-[3px]" />
          </button>

          <input
            type="number"
            value={cartItemData.quantity}
            className="w-full bg-transparent text-center font-bold text-xl outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            onChange={(e) => onQtyChange(e.target.value)}
            onClick={(e) => e.preventDefault()}
          />

          <button
            onClick={(e) => {
              e.preventDefault();
              inc(cartItemData.quantity);
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[3px]" />
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
