import { Email, FullAdress, Phone, CompanyName, INN } from "@/lib/consts";
import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  const Contacts = [
    CompanyName ? `Компания: ${CompanyName}` : null,
    INN ? `ИНН: ${INN}` : null,
    FullAdress,
    Phone,
    Email,
  ].filter(Boolean) as string[];
  const categorys = [
    {
      name: "Каталог",
      link: "/catalog",
    },
    {
      name: "Почему выбирают нас",
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
  ];
  return (
    <div>
      <footer className="border-t grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto px-4  py-8 md:py-20">
        <div className="flex flex-col gap-5 px-2 md:px-4 py-6 md:py-[80px] md:border-r">
          <Image src="/logo_.jpg" alt="logo" width={180} height={80} />
          <div className="flex flex-col gap-4">
            <p className="text-sm font-normal">
              Все материалы на сайте являются авторским уникальным контентом.
              Копирование материалов с сайта преследуется по закону.
            </p>
            <p className="text-sm font-normal">
              Данный ресурс не является публичной офертой и носит исключительно
              информационный характер.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 px-2 md:px-4 py-6 md:py-[80px] md:border-r">
          <h3 className="font-medium text-xl">Покупателям</h3>
          <div className="flex flex-col gap-2">
            {categorys.map((cat, index) => (
              <Link key={index} href={cat.link}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 px-2 md:px-4 py-6 md:py-[80px] md:border-r">
          <h3 className="font-medium text-xl">Контакты</h3>
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

        <div className="flex items-center justify-center px-0 md:px-0">
          <div className="w-full max-w-[390px] overflow-hidden">
            <iframe
              className="w-full h-[260px] rounded-xl"
              src="https://yandex.ru/map-widget/v1/?um=constructor%3Ab57356a7883ee85d673978b787538bb1a0fc9325d417456173c7d9a6a6c9b740&amp;source=constructor"
              title="Карта расположения компании"
              loading="lazy"
              style={{ border: 0 }}
            ></iframe>
          </div>
        </div>
      </footer>
    </div>
  );
};
