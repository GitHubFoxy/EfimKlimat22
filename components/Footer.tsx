"use client";

import { Email, FullAdress, Phone, CompanyName, INN } from "@/lib/consts";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Footer = () => {
  const Contacts = [
    CompanyName ? `Компания: ${CompanyName}` : null,
    INN ? `ИНН: ${INN}` : null,
    FullAdress,
    Phone,
    Email,
  ].filter(Boolean) as string[];
  const categories = [
    {
      name: "Каталог",
      link: "/catalog",
    },
    {
      name: "Почему выбирают нас",
      link: "#whyus",
    },
    {
      name: "Популярное",
      link: "#best-deals",
    },
    {
      name: "Партнеры",
      link: "#partners",
    },
  ];
  return (
    <div>
      <footer className="border-t grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto px-4  py-8 md:py-20">
        <div className="flex flex-col gap-5 px-2 md:px-4 py-6 md:py-[80px] md:border-r">
          <Image src="/logo_.jpg" alt="logo" width={180} height={80} />
          <div className="flex flex-col gap-4">
            <p className="text-sm font-normal">
              Все материалы на сайте являются авторским уникальным контентом.
              Копирование материалов с сайта преследуется по закону.
            </p>
            <p className="text-sm font-normal">
              Данный ресурс не является публичной офертой и носит исключительно
              информационный характер.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 px-2 md:px-4 py-6 md:py-[80px] md:border-r">
          <h3 className="font-medium text-xl">Покупателям</h3>
          <div className="flex flex-col gap-2">
            {categories.map((cat, index) => (
              <Link key={index} href={cat.link}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 px-2 md:px-4 py-6 md:py-[80px] md:border-r">
          <h3 className="font-medium text-xl">Контакты</h3>
          <div className="flex flex-col gap-2">
            {Contacts.map((contact, index) => (
              <p key={index}>{contact}</p>
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-4">
            <Dialog>
              <DialogTrigger asChild>
                <span className="underline cursor-pointer text-blue-700">Пользовательское соглашение</span>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Политика конфиденциальности и безопасности данных</DialogTitle>
                  <DialogDescription>
                    Настоящая Политика конфиденциальности персональных данных (далее – Политика) действует в отношении всей информации, которую Интернет-магазин {CompanyName || "[Название вашего магазина]"}, расположенный на доменном имени klimat22.com, может получить о Пользователе во время использования сайта.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 text-sm text-gray-800">
                  <div>
                    <p className="font-semibold">1. Сбор и использование информации</p>
                    <p>Мы собираем следующие персональные данные для обработки и выполнения вашего заказа:</p>
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      <li>Фамилия, Имя, Отчество;</li>
                      <li>Контактный телефон;</li>
                      <li>Адрес электронной почты (e-mail);</li>
                      <li>Адрес доставки Товара.</li>
                    </ul>
                    <p className="mt-2">Эта информация используется исключительно для связи с вами, оформления доставки и отправки вам уведомлений о статусе заказа и электронного фискального чека.</p>
                  </div>

                  <div>
                    <p className="font-semibold">2. Защита информации и безопасность платежей</p>
                    <p>Мы придаем большое значение безопасности ваших данных.</p>
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      <li>
                        <strong>SSL-шифрование:</strong> Все данные, которые вы вводите на нашем сайте, передаются по защищенному протоколу HTTPS с использованием SSL-шифрования, что исключает их перехват третьими лицами.
                      </li>
                      <li>
                        <strong>Безопасность онлайн-платежей:</strong> При оплате заказа с помощью банковской карты, обработка платежа (включая ввод номера карты) происходит на защищенной странице процессинговой системы банка-эквайера. Это означает, что ваши конфиденциальные данные не поступают в наш интернет-магазин и их обработка полностью защищена.
                      </li>
                      <li>
                        Для защиты информации от несанкционированного доступа на этапе передачи от клиента на сервер системы используется протокол SSL/TLS. Дальнейшая передача информации осуществляется по закрытым банковским сетям высшей степени защиты. Обработка данных карт производится по стандарту безопасности PCI DSS.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold">3. Передача данных третьим лицам</p>
                    <p>Мы не передаем ваши персональные данные третьим лицам, за исключением случаев, когда это необходимо для выполнения наших обязательств перед вами (например, передача контактных данных и адреса курьерской службе для доставки заказа).</p>
                  </div>

                  <div>
                    <p className="font-semibold">4. Ваши права</p>
                    <p>
                      Вы имеете право на доступ, изменение или удаление ваших персональных данных. Для этого, пожалуйста, свяжитесь с нами по электронной почте: {Email || "[Ваш E-mail]"}.
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">5. Заключительные положения</p>
                    <p>
                      Используя наш сайт, вы соглашаетесь с настоящей Политикой конфиденциальности. Мы оставляем за собой право вносить изменения в Политику, поэтому рекомендуем периодически посещать эту страницу.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <span className="underline cursor-pointer text-blue-700">Условия возврата и отмены</span>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Условия возврата и отмены</DialogTitle>
                  <DialogDescription>Возврат товара, отмена заказа и возврат денежных средств</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 text-sm text-gray-800">
                  <p>
                    Мы ценим наших клиентов и стремимся сделать процесс покупки максимально комфортным. Если по какой-либо причине вам не подошел товар, вы можете вернуть его в соответствии с правилами ниже.
                  </p>

                  <div>
                    <p className="font-semibold">1. Условия возврата товара</p>
                    <p>Вы можете вернуть товар надлежащего качества в течение 7 (семи) календарных дней после его получения.</p>
                    <p className="mt-2">Возврат товара надлежащего качества возможен в случае, если:</p>
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      <li>Товар не был в употреблении;</li>
                      <li>Сохранены его товарный вид (упаковка, пломбы, ярлыки) и потребительские свойства;</li>
                      <li>Имеется документ, подтверждающий факт и условия покупки указанного товара (кассовый или товарный чек).</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold">2. Процедура возврата товара</p>
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      <li>
                        <strong>Сообщите нам о возврате:</strong> Свяжитесь с нами по электронной почте {Email || "[Ваш E-mail]"} или по телефону {Phone || "[Ваш телефон]"} и сообщите о своем намерении вернуть товар.
                      </li>
                      <li>
                        <strong>Заполните заявление:</strong> Скачайте и заполните форму заявления на возврат (<Link href="#">ссылка на шаблон</Link>). Отправьте скан или фото заполненного заявления на наш e-mail.
                      </li>
                      <li>
                        <strong>Отправьте товар:</strong> Отправьте товар и оригинал заявления нам по адресу: {FullAdress || "[Ваш адрес для возвратов]"}. Расходы на доставку возвращаемого товара несет покупатель.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold">3. Порядок возврата денежных средств</p>
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      <li>После получения нами товара и заявления, мы проверим состояние товара в течение 1-3 рабочих дней.</li>
                      <li>Возврат денежных средств осуществляется в срок до 10 календарных дней с момента получения нами возвращаемого товара.</li>
                      <li>
                        <strong>Важно:</strong> Возврат переведенных средств производится на вашу банковскую карту, с которой была произведена оплата. Срок поступления денежных средств на вашу карту зависит от вашего банка-эмитента и может составлять от 5 до 30 рабочих дней.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold">Отмена заказа и возврат денежных средств</p>
                    <div className="mt-2 space-y-2">
                      <div>
                        <p className="font-medium">1. Условия отмены заказа</p>
                        <p>Вы можете отменить ваш заказ в любой момент до его передачи в службу доставки. Статус заказа можно уточнить у наших менеджеров по телефону {Phone || "[Ваш телефон]"}.</p>
                      </div>
                      <div>
                        <p className="font-medium">2. Процедура отмены заказа</p>
                        <ul className="list-disc pl-5 space-y-1 mt-1">
                          <li>Для отмены заказа, пожалуйста, свяжитесь с нами как можно скорее любым удобным для вас способом:</li>
                          <li>По телефону: {Phone || "[Ваш телефон]"}</li>
                          <li>По электронной почте: {Email || "[Ваш E-mail]"}</li>
                        </ul>
                        <p className="mt-1">Пожалуйста, сообщите номер заказа и ФИО, чтобы мы могли оперативно его найти и отменить.</p>
                      </div>
                      <div>
                        <p className="font-medium">3. Порядок возврата денежных средств при отмене</p>
                        <ul className="list-disc pl-5 space-y-1 mt-1">
                          <li>Если вы отменили заказ до его отправки, мы произведем возврат денежных средств в полном объеме.</li>
                          <li>Возврат осуществляется в течение 1-3 рабочих дней (но не позднее 10 дней) с момента получения вашего запроса на отмену.</li>
                          <li><strong>Важно:</strong> Возврат переведенных средств производится на вашу банковскую карту, с которой была произведена оплата. Срок поступления денежных средств на вашу карту зависит от вашего банка-эмитента и может составлять от 5 до 30 рабочих дней.</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">Что делать, если заказ уже отправлен?</p>
                        <p>Если заказ уже был передан в службу доставки на момент вашего обращения, отменить его невозможно. В этом случае вам необходимо будет воспользоваться процедурой возврата товара после его получения. Подробные условия описаны в разделе «Возврат товара» на этой странице.</p>
                      </div>
                    </div>
                  </div>

                  <p>Если у вас возникли вопросы, пожалуйста, свяжитесь с нашей службой поддержки.</p>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <span className="underline cursor-pointer text-blue-700">Лицензии и сертификаты</span>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Лицензии и сертификаты</DialogTitle>
                  <DialogDescription>Информация о лицензировании и сертификатах</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 text-sm text-gray-800">
                  <p>
                    В соответствии с действующим законодательством Российской Федерации, деятельность по розничной продаже бытового климатического оборудования и оказанию услуг по его стандартному монтажу не подлежит обязательному лицензированию.
                  </p>
                  {/*
                    При необходимости вы можете дополнить раздел перечнем сертификатов соответствия (например, EAC, GOST, ТР ТС),
                    а также приложить сканы бланков. Если требуется, сообщите — добавим список и ссылки/изображения.
                  */}
                </div>
              </DialogContent>
            </Dialog>

            <Link href={"#"}>Политика конфиденциальности</Link>
          </div>
        </div>

        <div className="flex items-center justify-center px-0 md:px-0">
          <div className="w-full max-w-[390px] overflow-hidden">
            <iframe
              className="w-full h-[260px] rounded-xl"
              src="https://yandex.ru/map-widget/v1/?um=constructor%3Ab57356a7883ee85d673978b787538bb1a0fc9325d417456173c7d9a6a6c9b740&amp;source=constructor"
              title="Карта расположения компании"
              loading="lazy"
              style={{ border: 0 }}
            ></iframe>
          </div>
        </div>
      </footer>
    </div>
  );
};
