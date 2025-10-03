"use client";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export default function HeaderSearch({ className }: { className?: string }) {
  const [searchValue, setSearchValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      className={twMerge(
        "flex flex-row  items-center justify-center rounded-full px-2 outline ",
        className,
      )}
      onClick={() => ref.current?.focus()}
    >
      <Search className="opacity-50" />
      <Input
        ref={ref}
        placeholder="Поиск"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="outline-none border-none focus-visible:outline-none focus-visible:ring-0 "
      />
    </div>
  );
}
