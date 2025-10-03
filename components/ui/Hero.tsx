import Image from "next/image";
import { Button } from "./button";

export const Hero = () => {
  return (
    <main className="flex flex-col gap-2">
      <div className="flex flex-col gap-4 p-6 bg-light-gray rounded-[30px]">
        <div className="flex flex-col gap-2 ">
          <h1 className="text-base font-[500] w-[25ch]">
            Широкий ассортимент климатического оборудования
          </h1>
          <h2 className="">
            Поможем создать комфортный климат в любом помещении
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          <Button className="bg-light-orange h-[36px] rounded-full">
            Выбрать товары
          </Button>
          <Button
            className="bg-transparent border border-blackish h-[36px] rounded-full"
            variant={"outline"}
          >
            Заказать консультацию
          </Button>
        </div>
      </div>
      <div className="relative w-full h-[200px] object-cover">
        <Image
          className="sm:hidden z-0"
          src={"/hero.jpg"}
          alt="Большой выбор материалов, Более 20 лет на рынке, Доставка по барнаулу"
          fill={true}
        />
      </div>
    </main>
  );
};
