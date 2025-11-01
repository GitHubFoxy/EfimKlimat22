"use client";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "../ui/button";
import Link from "next/link";

export default function HeaderSearch({ className }: { className?: string }) {
  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  // Basic debouncing to avoid spamming queries on very fast typing.
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchValue), 200);
    return () => clearTimeout(t);
  }, [searchValue]);

  const results = useQuery(api.main.search_items, { query: debounced }) ?? [];

  return (
    <div
      className={twMerge(
        "relative flex flex-row items-center justify-center rounded-full px-2 outline border border-gray-200 bg-white",
        className,
      )}
      onClick={() => ref.current?.focus()}
    >
      <Search className="opacity-50 mr-2" />
      <Input
        ref={ref}
        placeholder="Поиск товаров"
        value={searchValue}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 100)}
        onChange={(e) => setSearchValue(e.target.value)}
        className="outline-none border-none focus-visible:outline-none focus-visible:ring-0 px-0"
      />

      {isOpen && results?.length > 0 && (
        <div className="absolute left-0 top-full mt-2 w-[min(28rem,80vw)] max-h-80 overflow-auto rounded-2xl border border-gray-200 bg-white shadow-lg z-20">
          <ul className="divide-y">
            {results.map((item: any) => (
              <li
                key={item._id?.toString?.() ?? item._id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                onMouseDown={(e) => {
                  // Prevent blur so click works before closing.
                  e.preventDefault();
                }}
                onClick={() => {
                  setSearchValue(item.name);
                  setIsOpen(false);
                }}
              >
                {/* Thumbnail */}
                <img
                  src={
                    (item.imagesUrls && item.imagesUrls.length > 0
                      ? item.imagesUrls[0]
                      : "/not-found.jpg")
                  }
                  alt={item.name}
                  className="w-10 h-10 rounded-md object-cover"
                />
                {/* Title & Price */}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 line-clamp-1">
                    {item.name}
                  </div>
                  {typeof item.price === "number" && (
                    <div className="text-xs text-gray-600">{item.price} ₽</div>
                  )}
                </div>
              </li>
            ))}
            <li
              className="p-2"
              onMouseDown={(e) => {
                // Prevent input blur so click navigates cleanly.
                e.preventDefault();
              }}
            >
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full justify-center rounded-xl bg-light-orange text-white"
              >
                <Link
                  href={
                    debounced
                      ? `/catalog?query=${encodeURIComponent(debounced)}`
                      : "/catalog"
                  }
                  aria-label="Смотреть все результаты"
                >
                  Смотреть все
                </Link>
              </Button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
