"use client";
import Image from "next/image";
import Link from "next/link";
import { FormaObratnoySvyzi } from "./ui/FormaObratnoySvyzi";

export const Header = () => {
  return (
    <header className="p-4 flex items-center justify-between">
      <Image alt="" src={"/logo_.jpg"} width={150} height={150} />
      <div className="flex items-center gap-4">
        <Link
          className="hover:underline underline-offset-5 text-lg"
          href={"/catalog"}
        >
          Каталог
        </Link>
        <Link className="hover:underline underline-offset-5 text-lg" href={"/"}>
          Контакты
        </Link>
        <Link className="hover:underline underline-offset-5" href={"/"}>
          <FormaObratnoySvyzi />
        </Link>
      </div>

      {/* <h1>Более 20 лет на рынке инженерной сантехники города Барнаул</h1>
      <p>
        Мы предлагаем широкий ассортимент климатического оборудования от ведущих
        брендов. Поможем создать комфортный климат в любом помещении.
      </p> */}
    </header>
  );
};
