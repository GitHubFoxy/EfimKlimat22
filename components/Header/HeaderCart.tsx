"use client";
import { ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export default function Cart({ className }: { className?: string }) {
  const [items, setItems] = useState<undefined | number>(1);
  return (
    <Button
      className={twMerge(
        "relative w-12 h-12 bg-light-orange rounded-full cursor-pointer",
        className,
      )}
    >
      <ShoppingCart />
      {items && (
        <p className="top-0 right-0 absolute w-3 h-3 rounded-full bg-white border-dark-gray text-black flex items-center justify-center text-xs">
          {items}
        </p>
      )}
    </Button>
  );
}
