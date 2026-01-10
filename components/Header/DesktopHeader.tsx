"use client";

import { telegramLink, whatsappLink } from "@/lib/consts";
import { MapPin, Phone } from "lucide-react";
import { useState } from "react";
import Cart from "../Cart/HeaderCart";
import { Button } from "../ui/button";
import HeaderSearch from "./HeaderSearch";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const DesktopHeader = ({ PhoneNumber }: { PhoneNumber: string }) => {
  const categories = [
    {
      name: "Главная",
      link: "/",
    },
    {
      name: "Каталог",
      link: "/catalog",
    },
    {
      name: "Почему мы",
      link: "/#whyus",
    },
    {
      name: "Популярное",
      link: "/#best-deals",
    },
    {
      name: "Партнеры",
      link: "/#partners",
    },
  ];
  const [copied, setCopied] = useState(false);

  return (
    <header className="flex-col flex ">
      <div className="flex flex-row justify-between items-center py-4 border-b-2">
        <HeaderSearch />
        <div className="flex gap-6 items-center">
          <Link href={"https://yandex.ru/maps/-/CLRjzI5Q"} target="_blank">
            <div className="flex gap-2 hover:cursor-pointer">
              <MapPin />
              <p className="font-inter font-normal">Барнаул</p>
            </div>
          </Link>

          <div className="flex gap-2">
            <Link href={telegramLink}>
              <Image
                alt="telegram-logo"
                src={"/telegram-icon.svg"}
                width={33}
                height={33}
                className="cursor-pointer"
              />
            </Link>
            <Link href={whatsappLink}>
              <Image
                alt="whatsapp-logo"
                src={"/whatsapp-icon.svg"}
                width={33}
                height={33}
                className="cursor-pointer"
              />
            </Link>
          </div>
          <Button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(PhoneNumber);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch {
                // Ignore clipboard errors
              }
            }}
            aria-live="polite"
            title="Скопировать номер"
            className="bg-blackish hover:bg-blackish rounded-full cursor-pointer"
          >
            <Phone />
            <span className="ml-1">
              {copied ? "Скопировано!" : PhoneNumber}
            </span>
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Link href="/">
          <Image
            alt="Company logo"
            src={"/logo_.jpg"}
            height={80}
            width={180}
          />
        </Link>
        <div className="lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
          <div className="flex gap-9">
            {categories.map((category, index) => {
              return (
                <Link
                   className={cn(
                     "relative no-underline transition-colors duration-300",
                     "before:content-[''] before:absolute before:w-1 before:h-0.5 before:bg-blackish",
                     "before:bottom-0 before:left-0 before:opacity-0",
                     "hover:before:w-full hover:before:opacity-100 before:transition-all before:duration-300"
                   )}
                   key={index}
                   href={category.link}
                  onClick={(e) => {
                    if (category.link.includes('#')) {
                      e.preventDefault();
                      const id = category.link.split('#')[1];
                      const el = document.getElementById(id);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Preserve hash in URL without full navigation
                        const base = location.pathname === '/' ? '' : '/';
                        history.replaceState(null, '', `${base}#${id}`);
                      } else {
                        // Fallback: navigate to the target route with hash
                        window.location.href = category.link;
                      }
                    }
                  }}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        </div>
        <Cart />
      </div>
    </header>
  );
};
