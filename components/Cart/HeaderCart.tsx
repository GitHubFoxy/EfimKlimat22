"use client";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useRef, useSyncExternalStore } from "react";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import Image from "next/image";
import { Input } from "../ui/input";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCartSessionId } from "@/hooks/useCartSession";
import { Id } from "@/convex/_generated/dataModel";

const emptySubscribe = () => () => {};

export default function Cart({ className }: { className?: string }) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const router = useRouter();
  const sessionId = useCartSessionId();

  const itemsData = useQuery(api.cart.listItems, sessionId ? { sessionId } : "skip");
  const summary = useQuery(api.cart.get, sessionId ? { sessionId } : "skip");

  const updateQty = useMutation(api.cart.updateQty);
  // TODO: optimistic UI updates for quantity can be re-added here later

  const removeItem = useMutation(api.cart.removeItem);
  // TODO: optimistic UI updates for item removal can be re-added here later

  const clear = useMutation(api.cart.clear);
  // TODO: optimistic UI updates for clearing cart can be re-added here later

  // Debounce map per cart item
  const debounceTimers = useRef<Record<string, any>>({});

  const inc = (cartItemId: Id<"cartItems">, quantity: number) => {
    updateQty({ cartItemId, quantity: quantity + 1 });
  };
  const dec = (cartItemId: Id<"cartItems">, quantity: number) => {
    updateQty({ cartItemId, quantity: quantity - 1 });
  };
  const onQtyChange = (cartItemId: Id<"cartItems">, value: string) => {
    const q = Math.max(0, Math.min(99, parseInt(value || "0", 10) || 0));
    if (debounceTimers.current[cartItemId]) {
      clearTimeout(debounceTimers.current[cartItemId]);
    }
    debounceTimers.current[cartItemId] = setTimeout(() => {
      updateQty({ cartItemId, quantity: q });
    }, 300);
  };

  if (!isMounted) {
    return (
      <Button
        className={twMerge(
          "relative w-12 h-12 bg-light-orange rounded-full cursor-pointer",
          className,
        )}
      >
        <ShoppingCart />
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={twMerge(
            "relative w-12 h-12 bg-light-orange rounded-full cursor-pointer",
            className,
          )}
        >
          <ShoppingCart />
          {itemsData && itemsData.count > 0 && (
            <p className="top-0 right-0 absolute w-3 h-3 rounded-full bg-white border-dark-gray text-black flex items-center justify-center text-xs">
              {itemsData.count}
            </p>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Корзина</DialogTitle>
        </DialogHeader>
        <div>
          {!itemsData ? (
            <div className="space-y-4">
              <div className="animate-pulse h-6 bg-blackish/10 rounded" />
              <div className="animate-pulse h-6 bg-blackish/10 rounded" />
              <div className="animate-pulse h-6 bg-blackish/10 rounded" />
            </div>
          ) : itemsData.items && itemsData.items.length > 0 ? (
            <div>
              {itemsData.items.map((item: any) => (
                <div key={item._id}>
                  <div className="grid grid-cols-3">
                    <div className="w-24 h-24 p-2 rounded-lg relative place-self-center col-span-1 bg-gray-50 border border-gray-200">
                      <Image
                        src={item.image ?? "/kotel.jpg"}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="col-span-2 flex gap-2 flex-col">
                      <p>{item.name}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center flex-row-reverse">
                          <div
                            onClick={() => inc(item._id, item.quantity)}
                            className="border border-blackish/20 border-l-0 w-8 h-8 grid place-content-center rounded-r-xl"
                          >
                            <Plus size={14} />
                          </div>
                          <Input
                            value={item.quantity}
                            className="w-8 h-8 p-1 text-center rounded-none border-blackish/20 spin"
                            autoFocus={false}
                            onChange={(e) =>
                              onQtyChange(item._id, e.target.value)
                            }
                          />
                          <div
                            onClick={() => dec(item._id, item.quantity)}
                            className="border border-blackish/20 border-r-0 w-8 h-8 grid place-content-center rounded-l-xl"
                          >
                            <Minus size={14} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="flex gap-2"
                            onClick={() => removeItem({ cartItemId: item._id })}
                          >
                            Удалить <Trash2 />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        {Number(item.price).toLocaleString("ru-RU")} руб.
                      </div>
                    </div>
                  </div>
                  <hr className="my-4" />
                </div>
              ))}
              <div className="flex justify-between">
                <div className="flex flex-col gap-2">
                  <p>Итого к оплате:</p>
                  <p>{itemsData.subtotal.toLocaleString("ru-RU")} руб.</p>
                </div>
                <div
                  className="flex gap-2 cursor-pointer"
                  onClick={() => sessionId && clear({ sessionId })}
                >
                  Очистить корзину <Trash2 />
                </div>
              </div>
            </div>
          ) : (
            <p>Корзина пуста</p>
          )}
        </div>
        <hr />

        <DialogFooter>
          <Button
            variant={"outline"}
            className="border-blackish rounded-full h-12 cursor-pointer"
            onClick={() => {
              if (itemsData && itemsData.count > 0) {
                router.push("/checkout");
              } else {
                router.push("/catalog");
              }
            }}
          >
            {itemsData && itemsData.count > 0
              ? "Перейти к оформлению"
              : "Вернуться к покупкам"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
