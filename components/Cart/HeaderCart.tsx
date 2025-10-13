"use client";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
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

export default function Cart({ className }: { className?: string }) {
  const [items, setItems] = useState<
    {
      name: string;
      price: string;
      quantity: number;
      img: string;
    }[]
  >([
    {
      name: "Тестовый товар",
      price: "1000",
      quantity: 1,
      img: "/kotel.jpg",
    },
  ]);

  const inc = (index: number) =>
    setItems((prev) =>
      prev.map((it, i) =>
        i === index ? { ...it, quantity: it.quantity + 1 } : it,
      ),
    );
  const dec = (index: number) =>
    setItems((prev) =>
      prev.map((it, i) =>
        i === index ? { ...it, quantity: it.quantity - 1 } : it,
      ),
    );

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
          {items && items.length > 0 && (
            <p className="top-0 right-0 absolute w-3 h-3 rounded-full bg-white border-dark-gray text-black flex items-center justify-center text-xs">
              {items.length}
            </p>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Корзина</DialogTitle>
        </DialogHeader>
        <div>
          {items && items.length > 0 ? (
            <div>
              {items.map((item, index) => (
                <div key={index}>
                  <div className="grid grid-cols-3">
                    <div className="w-[43px] h-[89px] px-1 py-5 rounded relative  place-self-center  col-span-1">
                      <Image src={item.img} alt={item.name} fill />
                    </div>
                    <div className="col-span-2 flex gap-2 flex-col">
                      <p>{item.name}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center flex-row-reverse">
                          <div
                            onClick={() => inc(index)}
                            className="border border-blackish/20 border-l-0 w-8 h-8 grid place-content-center rounded-r-xl"
                          >
                            <Plus size={14} />
                          </div>
                          <Input
                            value={item.quantity}
                            className="w-8 h-8 p-1 text-center rounded-none border-blackish/20 spin"
                            autoFocus={false}
                          />
                          <div
                            onClick={() => dec(index)}
                            className="border border-blackish/20 border-r-0 w-8 h-8 grid place-content-center rounded-l-xl"
                          >
                            <Minus size={14} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          Удалить <Trash2 />
                        </div>
                      </div>
                      <div className="text-right">
                        {parseFloat(item.price).toLocaleString()} руб.
                      </div>
                    </div>
                  </div>
                  <hr className="my-4" />
                  <div className="flex justify-between">
                    <div className="flex flex-col gap-2">
                      <p>Итого к оплате:</p>
                      <p>
                        {items.reduce(
                          (acc, cur) =>
                            acc + cur.quantity * parseFloat(cur.price),
                          0,
                        )}{" "}
                        руб.
                      </p>
                    </div>
                    <div
                      className="flex gap-2 cursor-pointer"
                      onClick={() => setItems([])}
                    >
                      Очистить корзину <Trash2 />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Корзина пуста</p>
          )}
        </div>
        <hr />

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant={"outline"}
              className="border-blackish rounded-full h-12"
            >
              {items && items.length > 0
                ? "Перейти к оформлению"
                : "Вернуться к покупкам"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
