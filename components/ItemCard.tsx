"use client";
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

// Strong type for catalog item documents
type Item = Doc<"items">;

export const ItemCard = ({ e }: { e: Item }) => {
  const sessionId = useCartSessionId();

  const onAdd = async () => {
    if (!sessionId) return;
    try {
    } catch (err) {
      console.error("Failed to add to cart", err);
    }
  };
  return (
    <>
      <div className="cursor-pointer  rounded-lg w-full h-[350px] flex items-center justify-center">
        <Carousel className="w-full   rounded-2xl  flex items-center justify-center">
          <CarouselContent>
            {(e.imagesUrls && e.imagesUrls.length > 0
              ? e.imagesUrls
              : ["/not-found.jpg"]
            ).map((img: string, index: number) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card className="border-none shadow-none">
                    <CardContent className="flex aspect-square items-center justify-center ">
                      <img
                        src={img ?? "/not-found.jpg"}
                        alt={`${e.brand ?? ""} ${e.name} ${e.variant ?? ""} кВт`}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="translate-x-[150px] translate-y-[130px] " />
          <CarouselNext className="-translate-x-[150px] translate-y-[130px] " />
        </Carousel>
      </div>
      <Stars stars={String(e.rating ?? 0)} />
      <div className="flex justify-between w-full items-start gap-3 min-h-[48px]">
        <p className="text-base leading-6 line-clamp-2 break-words flex-1 max-h-[48px] overflow-hidden">
          {e.brand ?? ""} "{e.name}" {e.variant ?? ""} кВт
        </p>
        <p className="font-[500] whitespace-nowrap shrink-0 text-right">
          {e.price} руб.
        </p>
      </div>
      <Button
        className="bg-light-orange w-full rounded-4xl h-14 cursor-pointer"
        onClick={onAdd}
        disabled={!sessionId}
      >
        В корзину
      </Button>
    </>
  );
};
export default ItemCard;
