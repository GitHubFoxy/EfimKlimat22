import { telegramLink, whatsappLink } from "@/lib/consts";
import { cn } from "@/lib/utils";
import { Phone } from "lucide-react";
import { useState } from "react";
import Cart from "../Cart/HeaderCart";
import { Button } from "../ui/button";
import HeaderSearch from "./HeaderSearch";
import Image from "next/image";
import Link from "next/link";

export function MobileHeader({ PhoneNumber }: { PhoneNumber: string }) {
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
                <Link
                  key={index}
                  className="font-normal"
                  href={e.link}
                  onClick={(ev) => {
                    if (e.link.includes("#")) {
                      ev.preventDefault();
                      const id = e.link.split("#")[1];
                      const el = document.getElementById(id);
                    if (el) {
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                        history.replaceState(null, "", `#${id}`);
                        setIsOpen(false);
                      } else {
                        // Element is not on the current page (e.g., we're on /catalog)
                        // Redirect to home with the anchor so the user lands at the correct section
                        setIsOpen(false);
                        window.location.href = `/#${id}`;
                      }
                    }
                  }}
                >
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
