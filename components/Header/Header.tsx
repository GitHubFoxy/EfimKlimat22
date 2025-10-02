import { MapPin, Phone } from "lucide-react";
import { Phone as PhoneNumber } from "@/lib/consts";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import Cart from "./HeaderCart";
import HeaderSearch from "./HeaderSearch";

export const Header = () => {
  const Categorys = [
    {
      name: "Главная",
      link: "#",
    },
    {
      name: "Почему мы",
      link: "#",
    },
    {
      name: "Популярное",
      link: "#",
    },
    {
      name: "Партнеры",
      link: "#",
    },
  ];

  return (
    <header className="flex-col flex ">
      <div className="flex flex-row justify-between items-center py-4 border-b-2">
        <HeaderSearch />
        <div className="flex gap-6 items-center">
          <div className="flex gap-2 hover:cursor-pointer">
            <MapPin />
            <p className="font-inter font-normal">Барнаул</p>
          </div>
          <div className="flex gap-2">
            <Image
              alt="telegram-logo"
              src={"/telegram-icon.svg"}
              width={33}
              height={33}
              className="cursor-pointer"
            />
            <Image
              alt="whatsapp-logo"
              src={"/whatsapp-icon.svg"}
              width={33}
              height={33}
              className="cursor-pointer"
            />
          </div>
          <Button className="bg-blackish hover:bg-blackish rounded-full cursor-pointer">
            <Phone />
            {PhoneNumber}
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Image alt="Company logo" src={"/logo_.jpg"} height={80} width={180} />
        <div className="absolute left-1/2 transform -translate-x-1/2">
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
