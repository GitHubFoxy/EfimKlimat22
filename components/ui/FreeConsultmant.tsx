import { Button } from "./button";
import { FormaObratnoySvyzi } from "./FormaObratnoySvyzi";

export default function FreeConsultmant() {
  return (
    <div className="flex flex-col justify-center items-center pb-4">
      <div className="flex flex-col items-center text-center max-w-lg mx-auto p-10">
        <h2 className="text-4xl font-bold mb-6">Подскажем и покажем</h2>
        <p className="mt-6 text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
          Если вы не уверены, какое оборудование лучше всего подойдёт для вас,
          получите бесплатную консультацию перед покупкой.
        </p>
      </div>
      <FormaObratnoySvyzi />
    </div>
  );
}
