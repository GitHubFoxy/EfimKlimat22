import BestDeals from "@/components/BestDeals";
import { Header } from "@/components/Header/Header";
import { Brands } from "@/components/ui/Brands";
import { Footer } from "@/components/ui/Footer";
import FreeConsultmant from "@/components/ui/FreeConsultmant";
import { Hero } from "@/components/ui/Hero";
import WhyUs from "@/components/WhyUs";

export default function Home() {
  return (
    <>
      <div className="max-w-6xl mx-auto ">
        <div className="flex flex-col gap-9 mb-[120px]">
          <Header />
          <Hero />
        </div>
        <WhyUs />
        <BestDeals />
        <Brands />
        <FreeConsultmant />
        <Footer />
      </div>
    </>
  );
}
