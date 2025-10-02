import Image from "next/image";
import { Button } from "./button";

export const Hero = () => {
  return (
    <main className="grid grid-cols-5 gap-4">
      <div className="bg-light-gray  col-span-3 rounded-4xl px-9 py-16 flex flex-col gap-9">
        <div className="flex gap-6 flex-col">
          <h1 className="font-inter font-[500] text-4xl">
            Широкий ассортимент климатического оборудования
          </h1>
          <h2 className="font-inter font-[400] text-2xl">
            Поможем создать комфортный климат в любом помещении
          </h2>
        </div>

        <div className="flex gap-4">
          <Button className="font-inter font-[500] text-lg rounded-4xl text-white bg-light-orange  cursor-pointer py-4 px-9 h-14">
            Выбрать товары
          </Button>
          <Button
            className="font-inter text-lg rounded-4xl bg-transparent border-black cursor-pointer py-4 px-9 h-14"
            variant={"outline"}
          >
            Заказать консультацию
          </Button>
        </div>
      </div>
      <Image
        className="col-span-2 rounded-4xl"
        src={"/hero.jpg"}
        alt="Большой выбор материалов, Более 20 лет на рынке, Доставка по барнаулу"
        width={486}
        height={429}
      />
    </main>
  );
};
