export default function WhyUs() {
  const array = [
    {
      part1: ">20",
      part2: "лет на рынке инженерной сантехники города Барнаул",
    },
    {
      part1: ">50 000 ",
      part2: "довольных клиентов",
    },
    {
      part1: "98%",
      part2: "положительных отзывов от наших клиентов",
    },
    {
      part1: "5",
      part2: "лет гарантии на оборудование",
    },
  ];
  return (
    <div className="flex flex-col md:gap-6 mb-[24px] md:mb-[120px]">
      <h1 className="font-[500] text-[14px] md:text-3xl text-center md:mb-6 mb-2 ">
        Почему выбирают нас
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {array.map((e, index) => {
          return (
            <div
              key={index}
              className="w-[282px] flex gap-2 flex-col items-start justify-center-safe"
            >
              <p className="text-[24px] md:text-5xl font-[500] text-light-orange">
                {e.part1}
              </p>
              <p className="text-blackish font-[400] text-[12px] md:text-[16px]">
                {e.part2}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
