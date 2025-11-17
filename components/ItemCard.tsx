"use client";
import { useState } from "react";
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
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

// Strong type for catalog item documents
type Item = Doc<"items"> & {
  variantsCount?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  variantRange?: {
    min: number;
    max: number;
  };
};

export const ItemCard = ({ e }: { e: Item }) => {
  const [isHovered, setIsHovered] = useState(false);
  const sessionId = useCartSessionId();
  const addItem = useMutation(api.cart.addItem);
  const router = useRouter();

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
        description: `${e.brand ?? ""} "${e.name}" ${e.variant ?? ""}`,
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

  const href = `/catalog/${e._id?.toString?.() ?? ""}`;

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image + Carousel Section */}
      <Link href={href} className="block w-full">
        <div className="relative w-full h-[350px] flex items-center justify-center  transition-colors rounded-2xl overflow-hidden mb-3">
          {/* Add badge for multiple variants */}
          {e.variantsCount && e.variantsCount > 1 && (
            <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md">
              {e.variantsCount} вариантов
            </div>
          )}
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full">
              {(e.imagesUrls && e.imagesUrls.length > 0
                ? e.imagesUrls
                : ["/not-found.jpg"]
              ).map((img: string, index: number) => (
                <CarouselItem key={index}>
                  <div className="relative w-full h-[350px] flex items-center justify-center">
                    <Image
                      src={img ?? "/not-found.jpg"}
                      alt={`${e.brand ?? ""} ${e.name} ${e.variant ?? ""} кВт`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      unoptimized={!e.imagesUrls || e.imagesUrls.length === 0}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Carousel controls - only show when images exist and card is hovered */}
            {e.imagesUrls && e.imagesUrls.length > 0 && isHovered && (
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
        <Stars stars={String(e.rating ?? 0)} />
      </div>

      {/* Name and Price on same line */}
      <Link href={href} className="block mb-3">
        <div className="flex flex-col justify-between items-start gap-3 min-h-12">
          <p className="text-base leading-6 line-clamp-2 wrap-break-word flex-1 max-h-12 overflow-hidden">
            {e.brand ?? ""} {e.name}{" "}
            {e.variantRange
              ? `${e.variantRange.min}${e.variantRange.min !== e.variantRange.max ? `-${e.variantRange.max}` : ""} кВт`
              : e.variant
                ? `${e.variant}`
                : ""}
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

      {/* Add to Cart Button */}
      <Button
        className="bg-light-orange w-full rounded-full h-14 cursor-pointer hover:bg-amber-500 transition-colors"
        onClick={onAdd}
        disabled={!sessionId}
      >
        В корзину
      </Button>
    </div>
  );
};

export default ItemCard;
