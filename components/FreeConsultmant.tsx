import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function FreeConsultmant() {
  return (
    <div className="mb-6 flex flex-col md:border-b md:border-t md:grid md:grid-cols-2 md:mb-[120px]">
      <div className="md:border-r md:py-[36px] pb-4">
        <h1 className="text-[14px] md:text-3xl font-[500] md:border-b md:pb-[24px] w-[20ch]">
          Получите бесплатную консультацию
        </h1>
        <p className="text-[12px] md:text-base font-[400] pt-[12px] md:pt-[90px] w-[42ch]">
          Не знаете какое оборудование лучше всего подойдёт для Вас? Наш
          менеджер поможет Вам.
        </p>
      </div>
      <div className="md:p-4 py-2 md:grid md:place-content-center">
        <form action="" className="flex flex-col gap-4">
          <div className="border-b ">
            <Input
              placeholder="Ваше имя"
              className="outline-none border-none shadow-none placeholder:text-dark-gray"
            />
          </div>
          <div className="border-b">
            <Input
              placeholder="Ваш телефон"
              className="outline-none border-none shadow-none placeholder:text-dark-gray"
            />
          </div>
          <div className="flex gap-2 items-center justify-center">
            <Checkbox className="w-5 h-5" />
            <Label className="font-inter font-[400] text-sm">
              Нажимая кнопку Вы соглашаетесь с Политикой конфиденциальности
            </Label>
          </div>
          <Button className="bg-light-orange h-[58px] rounded-full mt-4">
            Отправить
          </Button>
        </form>
      </div>
    </div>
  );
}
