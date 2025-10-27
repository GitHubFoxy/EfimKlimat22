"use client";
import { useMediaQuery } from "react-responsive";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MapPin, Phone } from "lucide-react";
import { Phone as PhoneNumber, telegramLink, whatsappLink } from "@/lib/consts";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import HeaderSearch from "./HeaderSearch";
import Cart from "../Cart/HeaderCart";

export default function Header() {
  const phone = useMediaQuery({ query: "(max-width: 729px)" });
  return (
    <div className="mb-6">
      <div className="block min-[730px]:hidden">
        <MobileHeader />
      </div>
      <div className="hidden min-[730px]:block">
        <DesktopHeader />
      </div>
    </div>
  );
}

export const DesktopHeader = () => {
  const Categorys = [
    {
      name: "Главная",
      link: "/",
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
              } catch { }
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
          <Image alt="Company logo" src={"/logo_.jpg"} height={80} width={180} />
        </Link>
        <div className="lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
          <div className="flex gap-9">
            {Categorys.map((category, index) => {
              return (
                <Link
                  className="relative no-underline  transition-colors duration-300
               before:content-[''] before:absolute before:w-1 before:h-0.5 before:bg-blackish
               before:bottom-0 before:left-0 before:opacity-0
               hover:before:w-full hover:before:opacity-100 before:transition-all before:duration-300"
                  key={index}
                  href={category.link}
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

export function MobileHeader() {
  const Categorys = [
    {
      name: "Главная",
      link: "/",
    },
    {
      name: "Почему мы",
      link: "#whyus",
    },
    {
      name: "Популярное",
      link: "#best-deals",
    },
    {
      name: "Партнеры",
      link: "#partners",
    },
    {
      name: "Каталог",
      link: "/catalog",
    },
  ];
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <Image src={"/logo_.jpg"} alt=" Company logo" height={40} width={72} />
        <Image
          src={"/burger.svg"}
          alt="Burger menu"
          height={24}
          width={24}
          onClick={() => setIsOpen(true)}
        />
      </div>
      <div
        className={cn(
          isOpen
            ? "absolute left-0 top-0 bg-blackish/80 z-10 w-full h-full flex justify-end"
            : "hidden",
        )}
        onClick={() => setIsOpen(false)}
      >
        <div className="flex flex-col gap-6 bg-white w-2/3 p-4">
          <div className="flex flex-col gap-2">
            {Categorys.map((e, index) => {
              return (
                <Link key={index} className="font-[400]" href={e.link}>
                  {e.name}
                </Link>
              );
            })}
          </div>
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
            asChild
            className="bg-blackish hover:bg-blackish rounded-full cursor-pointer"
          >
            <a href={`tel:${PhoneNumber}`} aria-label="Позвонить">
              <Phone />
              {PhoneNumber}
            </a>
          </Button>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between gap-2">
          <HeaderSearch className="" />
          <Cart className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}
