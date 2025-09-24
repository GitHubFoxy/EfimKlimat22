import Image from "next/image";

export const Hero = () => {
  return (
    <main>
      <Image
        src={"/____.jpg.webp"}
        alt="Большой выбор материалов, Более 20 лет на рынке, Доставка по барнаулу"
        width={1800}
        height={1200}
      />
    </main>
  );
};
