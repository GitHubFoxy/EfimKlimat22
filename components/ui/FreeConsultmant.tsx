import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";

export default function FreeConsultmant() {
  return (
    <div className="border-b border-t grid grid-cols-2 mb-[120px]">
      <div className="border-r py-[36px]">
        <h1 className="text-3xl font-[500] border-b pb-[24px] w-[20ch]">
          Получите бесплатную консультацию
        </h1>
        <p className="text-base font-[400] pt-[90px] w-[42ch]">
          Не знаете какое оборудование лучше всего подойдёт для Вас? Наш
          менеджер поможет Вам.
        </p>
      </div>
      <div className="p-4 ">
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
