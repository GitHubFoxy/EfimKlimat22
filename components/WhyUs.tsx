export default function WhyUs() {
  const array = [
    {
      part1: '>20',
      part2: 'лет на рынке инженерной сантехники города Барнаул',
    },
    {
      part1: '>1500',
      part2: 'довольных клиентов',
    },
    {
      part1: '98%',
      part2: 'положительных отзывов от наших клиентов',
    },
    {
      part1: 'Гарантия',
      part2: 'на все установленное оборудование',
    },
  ]
  return (
    <section id='whyus' className='mt-[24px] md:mt-[120px]'>
      <div className='flex flex-col gap-6 mb-[24px] md:mb-[120px]'>
        <h1 className='font-medium text-[14px] md:text-3xl text-center md:mb-6 mb-2 '>
          Почему выбирают нас
        </h1>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start'>
          {array.map((e, index) => {
            return (
              <div
                key={index}
                className='flex flex-col gap-2 items-center text-center md:items-start md:text-left'
              >
                <p className='text-[24px] md:text-5xl font-medium leading-tight text-light-orange'>
                  {e.part1}
                </p>
                <p className='text-blackish font-normal text-[12px] md:text-[16px]'>
                  {e.part2}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
