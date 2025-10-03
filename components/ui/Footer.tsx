import { Email, FullAdress, Phone } from "@/lib/consts";
import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  const Contacts = [FullAdress, Phone, Email];
  const categorys = [
    {
      name: "Каталог",
      link: "#",
    },
    {
      name: "Почему выбирают нас",
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
    <footer className="border-t grid grid-cols-4 ">
      <div className="flex flex-col gap-5 px-4 py-[80px] border-r">
        <Image src="/logo_.jpg" alt="logo" width={180} height={80} />
        <div className="flex flex-col gap-4">
          <p className="text-sm font-[400]">
            Все материалы на сайте являются авторским уникальным контентом.
            Копирование материалов с сайта преследуется по закону.
          </p>
          <p className="text-sm font-[400]">
            Данный ресурс не является публичной офертой и носит исключительно
            информационный характер.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-4 py-[80px] border-r">
        <h3 className="font-[500] text-xl">Покупателям</h3>
        <div className="flex flex-col gap-2">
          {categorys.map((cat, index) => (
            <Link key={index} href={cat.link}>
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 px-4 py-[80px] border-r">
        <h3 className="font-[500] text-xl">Контакты</h3>
        <div className="flex flex-col gap-2">
          {Contacts.map((contact, index) => (
            <p key={index}>{contact}</p>
          ))}
        </div>
        <div className="flex flex-col gap-2 pt-4">
          <Link href={"#"}>Пользовательское соглашение</Link>
          <Link href={"#"}>Политика конфиденциальности</Link>
        </div>
      </div>
      <div className="flex items-center pl-6">
        <div className="">
          <iframe
            className="w-[390px] h-[260px] rounded-xl"
            src="https://yandex.ru/map-widget/v1/?um=constructor%3Ab57356a7883ee85d673978b787538bb1a0fc9325d417456173c7d9a6a6c9b740&amp;source=constructor"
            width="500"
            height="400"
          ></iframe>
        </div>
      </div>
    </footer>
  );
};
