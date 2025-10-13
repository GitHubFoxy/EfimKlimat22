import Stars from "./stars";
import { Button } from "./ui/button";
import Image from "next/image";

export const Card = ({ e }: { e: any }) => {
  return (
    <>
      <div className="cursor-pointer hover:bg-dark-gray mb-4 bg-light-gray rounded-lg w-full h-[450px] flex items-center justify-center">
        <Image src={e.image} alt={e.name} width={163} height={340} />
      </div>
      <Stars stars={String(e.rating ?? 0)} />
      <div className="flex justify-between w-full items-center mb-9">
        <p className="text-base max-w-[20ch] truncate">{e.name}</p>
        <p className="font-[500]">{e.price} руб.</p>
      </div>
      <Button className="bg-light-orange w-full rounded-4xl h-14 cursor-pointer">
        В корзину
      </Button>
    </>
  );
};
export default Card;
