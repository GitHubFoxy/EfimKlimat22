import { Email, FullAdress, Phone } from "@/lib/consts";

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 dark:bg-gray-900/60 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col  items-start md:items-center justify-between gap-4">
        <div className="text-lg">
          <p></p>
          <p>
            Телефон:{" "}
            <a href={`tel:${Phone}`} className="text-blue-600 hover:underline">
              {Phone}
            </a>
          </p>
          <p>
            Электронная почта:{" "}
            <a
              href={`mailto:${Email}`}
              className="text-blue-600 hover:underline"
            >
              {Email}
            </a>
          </p>
          <p>
            Адрес:{" "}
            <a href={``} className="text-blue-600 hover:underline">
              {FullAdress}
            </a>
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          © {year} Климат22
        </div>
      </div>
    </footer>
  );
};
