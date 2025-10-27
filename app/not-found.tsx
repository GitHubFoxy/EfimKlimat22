import { Footer } from "@/components/Footer";
import Header from "@/components/Header/Header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-6 py-2 md:px-12 lg:px-28">
      <Header />
      <Pagenotfound />
      <Footer />
    </div>
  );
}

export function Pagenotfound() {
  return (
    <div className=" flex items-center justify-center relative">
      <div className="relative w-full ">
        <div className="bg-[url('/hero.jpg')] bg-cover bg-center rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/60 bg-opacity-40 rounded-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-4">Страница не найдена</h1>
            <p className="text-lg mb-8 opacity-90">
              Что-то пошло не так... Вернитесь на главную страницу
            </p>
            <Button className="bg-dark-orange text-white px-18 py-3 rounded-full text-base  font-medium transition-colors">
              <Link href={"/"}>Главная</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
