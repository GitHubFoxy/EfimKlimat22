import { Header } from "@/components/Header/Header";
import { Brands } from "@/components/ui/Brands";
import { Footer } from "@/components/ui/Footer";
import FreeConsultmant from "@/components/ui/FreeConsultmant";
import { Hero } from "@/components/ui/Hero";

export default function Home() {
  return (
    <>
      <div className="max-w-6xl mx-auto ">
        <div className="flex flex-col gap-9">
          <Header />
          <Hero />
        </div>
        <Brands />
        <FreeConsultmant />
        <Footer />
      </div>
    </>
  );
}
