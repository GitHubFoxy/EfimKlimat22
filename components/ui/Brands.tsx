import Image from "next/image";
export const Brands = () => {
  return (
    <section id="partners">
      <h2>Бренды</h2>
      <p>
        Сотрудничаем с надёжными партнёрами в области строительства и
        производства климатического оборудования.
      </p>
      <div className="grid grid-cols-5 gap-4">
        <Image
          width={160}
          height={34}
          src="/company_logos/Baxi.webp"
          alt="Baxi logo"
          className="mx-auto"
        />
        <Image
          width={160}
          height={34}
          src="/company_logos/Buderus.webp"
          alt="Buderus logo"
          className="mx-auto"
        />
        <Image
          width={160}
          height={34}
          src="/company_logos/Royal_thermo.webp"
          alt="Royal Thermo logo"
          className="mx-auto"
        />
        <Image
          width={160}
          height={34}
          src="/company_logos/Thermex.webp"
          alt="Thermex logo"
          className="mx-auto"
        />
        <Image
          width={160}
          height={34}
          src="/company_logos/atlantic.webp"
          alt="Atlantic logo"
          className="mx-auto"
        />
        <Image
          width={160}
          height={34}
          src="/company_logos/ballu.jpg.webp"
          alt="Ballu logo"
          className="mx-auto"
        />
        <Image
          width={160}
          height={34}
          src="/company_logos/boshc.webp"
          alt="Boshc logo"
          className="mx-auto"
        />
        <Image
          width={160}
          height={34}
          src="/company_logos/kentatsu.webp"
          alt="Kentatsu logo"
          className="mx-auto"
        />
        <Image
          width={160}
          height={34}
          src="/company_logos/navien.webp"
          alt="Navien logo"
          className="mx-auto"
        />
        <Image
          width={160}
          height={34}
          src="/company_logos/pumpman.png"
          alt="Pumpman logo"
          className="mx-auto"
        />
      </div>
    </section>
  );
};
