import { Header } from "@/components/Header";
import { Brands } from "@/components/ui/Brands";
import { Footer } from "@/components/ui/Footer";
import FreeConsultmant from "@/components/ui/FreeConsultmant";
import { Hero } from "@/components/ui/Hero";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Brands />
      <FreeConsultmant />
      <Footer />
    </>
  );
}
