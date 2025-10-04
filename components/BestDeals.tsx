"use client";
import Image from "next/image";
import { Button } from "./ui/button";
import { useState } from "react";
import Stars from "./stars";

export default function BestDeals() {
  const [active, setActive] = useState("Хиты продаж");
  const array = [
    {
      img: "/kotel.png",
      stars: "0",
      name: "Электрокотел Куппер Спутник-12 (2.0) черный",
      price: "21 970 руб.",
    },
    {
      img: "/kotel.png",
      stars: "5",
      name: "Электрокотел Куппер Спутник-12 (2.0) черный",
      price: "21 970 руб.",
    },
    {
      img: "/kotel.png",
      stars: "4",
      name: "Электрокотел Куппер Спутник-12 (2.0) черный",
      price: "21 970 руб.",
    },
  ];

  return (
    <div className="flex flex-col mb-32">
      <h1 className="text-[12px] md:text-3xl font-[500] text-center md:mb-6 mb-2">
        Выгодные предложения
      </h1>
      <div className="mb-4 border-b-2 pb-4 border-light-gray flex relative items-center justify-center">
        <Button className="text-[12px] md:text-base hidden md:block md:absolute right-0 bg-light-orange">
          Смотреть все
        </Button>
        <Button
          variant={"secondary"}
          className="text-[12px] md:text-base font-[700] text-black bg-transparent"
        >
          Хиты продаж
        </Button>
        <Button
          variant={"secondary"}
          className="text-[12px] md:text-base font-[400] text-black bg-transparent"
        >
          Новинки
        </Button>
        <Button
          variant={"secondary"}
          className="text-[12px] md:text-base font-[400] text-black bg-transparent"
        >
          Скидки
        </Button>
      </div>
      <div className="flex gap-6 flex-col md:flex-row">
        {array.map((e, index) => {
          return (
            <div
              key={index}
              className="  flex items-center flex-col justify-center w-full "
            >
              <div className="cursor-pointer hover:bg-dark-gray mb-4 bg-light-gray rounded-lg w-full h-[450px] flex items-center justify-center">
                <Image src={e.img} alt={e.name} width={163} height={340} />
              </div>
              <Stars stars={e.stars} />
              <div className="flex justify-between w-full items-center mb-9">
                <p className="text-base max-w-[20ch]">{e.name}</p>
                <p className="font-[500]">{e.price}</p>
              </div>
              <Button className="bg-light-orange w-full rounded-4xl h-14 cursor-pointer">
                В корзину
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
