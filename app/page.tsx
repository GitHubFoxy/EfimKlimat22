import BestDeals from '@/components/BestDeals'
import { Brands } from '@/components/Brands'
import FloatingCheckoutButton from '@/components/CatalogComponents/FloatingCheckoutButton'
import { Footer } from '@/components/Footer'
import FreeConsultmant from '@/components/FreeConsultmant'
import Header from '@/components/Header/Header'
import { Hero } from '@/components/Main/Hero'
import WhyUs from '@/components/WhyUs'

export default function Home() {
  return (
    <div className='px-6 py-2 md:px-12 lg:px-28'>
      <Header />
      <Hero />
      <WhyUs />
      <BestDeals />
      <Brands />
      <FreeConsultmant />
      <Footer />
      <FloatingCheckoutButton />
    </div>
  )
}
