"use client";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";

export default function HeaderSearch() {
  const [searchValue, setSearchValue] = useState("");
  return (
    <div className="flex flex-row  items-center justify-center rounded-full px-2 outline ">
      <Search className="opacity-50 " />
      <Input
        placeholder="Поиск"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="outline-none border-none focus-visible:outline-none focus-visible:ring-0"
      />
    </div>
  );
}
