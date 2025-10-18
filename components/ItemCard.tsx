"use client";
import Stars from "./stars";
import { Button } from "./ui/button";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCartSessionId } from "@/hooks/useCartSession";
import { Id } from "@/convex/_generated/dataModel";

type Item = {
  _id: string;
  name: string;
  image?: string;
  price: number;
  rating?: number;
};

export const Card = ({ e }: { e: Item }) => {
  const sessionId = useCartSessionId();
  const addItem = useMutation(api.cart.addItem).withOptimisticUpdate(() => {
    // Later: update a local cart badge count.
  });

  const onAdd = async () => {
    if (!sessionId) return;
    try {
      await addItem({ sessionId, itemId: e._id as Id<"items">, quantity: 1 });
    } catch (err) {
      console.error("Failed to add to cart", err);
    }
  };
  return (
    <>
      <div className="cursor-pointer hover:bg-dark-gray mb-4 bg-light-gray rounded-lg w-full h-[350px] flex items-center justify-center">
        <Image src={e.image!} alt={e.name} width={163} height={340} />
      </div>
      <Stars stars={String(e.rating ?? 0)} />
      <div className="flex justify-between w-full items-start gap-3 mb-9 min-h-[48px]">
        <p className="text-base leading-6 line-clamp-2 break-words flex-1 max-h-[48px] overflow-hidden">
          {e.name}
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
export default Card;
