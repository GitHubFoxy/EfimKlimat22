"use client";
import { ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

export default function Cart() {
  const [items, setItems] = useState<undefined | number>(undefined);
  return (
    <Button className="relative w-12 h-12 bg-light-orange rounded-full cursor-pointer">
      <ShoppingCart />
      {items && (
        <p className="top-0 right-0 absolute w-4 h-4 rounded-full bg-white border-dark-gray text-black flex items-center justify-center text-xs">
          {items}
        </p>
      )}
    </Button>
  );
}
