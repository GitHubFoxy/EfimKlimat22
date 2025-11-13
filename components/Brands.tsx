import Image from "next/image";
export const Brands = () => {
  const brands = [
    {
      src: "/newlogos/BAXI.jpg",
      alt: "BAXI logo",
    },
    {
      src: "/newlogos/KENTTATSU.jpg",
      alt: "KENTTATSU logo",
    },
    {
      src: "/newlogos/NAVIEN.jpg",
      alt: "NAVIEN logo",
    },
    {
      src: "/newlogos/ROMMER.png",
      alt: "ROMMER logo",
    },
    {
      src: "/newlogos/ROYAL.jpg",
      alt: "ROYAL logo",
    },
    {
      src: "/newlogos/RTP.png",
      alt: "RTP logo",
    },
    {
      src: "/company_logos/valtek.webp",
      alt: "VALTEK logo",
    },
  ];

  return (
    <section id="partners" className="flex flex-col gap-6 mb-[120px]">
      <div className="flex flex-col gap-4">
        <h2 className="text-center py-4 text-3xl font-medium text-blackish ">
          Нам доверяют лидеры
        </h2>
        <p className="text-center py-2 mb-6 text-base font-normal text-blackish max-w-[500px] mx-auto">
          Сотрудничаем с надёжными партнёрами в области строительства и
          производства климатического оборудования
        </p>
      </div>
      <div className="flex flex-col md:grid md:grid-cols-5 gap-4  items-center grid-cols-1">
        {brands.map((e, index) => {
          return (
            <div
              key={index}
              className=" rounded-xl w-[220px] h-[140px] flex items-center justify-center shadow-lg"
            >
              <Image
                width={160}
                height={34}
                src={e.src}
                alt={e.alt}
                className="mx-auto object-contain w-full h-full p-6"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};
