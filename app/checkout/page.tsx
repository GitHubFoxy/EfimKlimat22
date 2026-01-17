"use client";

import { Footer } from "@/components/Footer";
import Header from "@/components/Header/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartSessionId } from "@/hooks/useCartSession";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CheckoutPage() {
  const router = useRouter();
  const sessionId = useCartSessionId();
  const itemsData = useQuery(
    api.cart.listItems,
    sessionId ? { sessionId } : "skip",
  );
  const summary = useQuery(api.cart.get, sessionId ? { sessionId } : "skip");
  const clear = useMutation(api.cart.clear);
  const createOrder = useMutation(api.cart.createOrder);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "Барнаул",
    street: "",
    addressDetails: "",
    comment: "",
    deliveryType: "courier" as "pickup" | "courier" | "transport",
    paymentMethod: "card_online" as
      | "card_online"
      | "cash_on_delivery"
      | "card_on_delivery"
      | "b2b_invoice",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionId || !itemsData?.items || itemsData.items.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Build address object only for non-pickup delivery
      const address =
        formData.deliveryType !== "pickup" && formData.city && formData.street
          ? {
              city: formData.city,
              street: formData.street,
              details: formData.addressDetails || undefined,
            }
          : undefined;

      // Create order in backend (Convex)
      const res = await createOrder({
        sessionId,
        clientName: formData.name,
        clientPhone: formData.phone,
        clientEmail: formData.email || undefined,
        deliveryType: formData.deliveryType,
        address,
        paymentMethod: formData.paymentMethod,
        deliveryPrice: 0, // Will be calculated by manager
      });

      // Optionally ensure local cart state clears
      await clear({ sessionId });

      setOrderComplete(true);

      // Redirect to order confirmation page after 2 seconds
      setTimeout(() => {
        router.push(`/order/${res.orderId}`);
      }, 2000);
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Произошла ошибка при оформлении заказа. Попробуйте еще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sessionId || !itemsData) {
    return (
      <div className="px-6 py-2 md:px-12 lg:px-28">
        <Header />
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">Загрузка...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (itemsData.items.length === 0 && !orderComplete) {
    return (
      <div className="px-6 py-2 md:px-12 lg:px-28">
        <Header />
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Корзина пуста</h1>
            <p className="mb-6">
              Добавьте товары в корзину перед оформлением заказа
            </p>
            <Button
              onClick={() => router.push("/catalog")}
              className="bg-light-orange hover:bg-amber-500 rounded-full px-8"
            >
              Перейти в каталог
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="px-6 py-2 md:px-12 lg:px-28">
        <Header />
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <svg
                className="w-20 h-20 mx-auto text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold mb-4">Заказ оформлен!</h1>
            <p className="text-lg mb-2">Спасибо за ваш заказ!</p>
            <p className="text-gray-600 mb-6">
              Наш менеджер свяжется с вами в ближайшее время для подтверждения
              заказа.
            </p>
            <p className="text-sm text-gray-500">
              Перенаправление на главную страницу...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="px-6 py-2 md:px-12 lg:px-28">
      <Header />

      <div className="max-w-6xl mx-auto my-12">
        <h1 className="text-3xl font-semibold mb-8">Оформление заказа</h1>

        <div className="grid grid-cols-1 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit row-start-1 lg:row-start-auto">
            <h2 className="text-xl font-semibold mb-6">Ваш заказ</h2>

            <div className="space-y-4 mb-6 ">
              {itemsData.items.map((item: any) => (
                <div key={item._id} className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-50">
                    <Image
                      src={item.image ?? "/kotel.jpg"}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Количество: {item.quantity} шт.
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      {(item.price * item.quantity).toLocaleString("ru-RU")}{" "}
                      руб.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <hr className="my-6" />

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Товаров:</span>
                <span>{itemsData.count} шт.</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Сумма:</span>
                <span>{itemsData.subtotal.toLocaleString("ru-RU")} руб.</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Доставка:</span>
                <span className="text-green-600">Уточняется</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-semibold">
                <span>Итого:</span>
                <span>{itemsData.subtotal.toLocaleString("ru-RU")} руб.</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Обратите внимание:</strong> Стоимость доставки будет
                рассчитана менеджером и сообщена вам при подтверждении заказа.
                <Dialog>
                  <DialogTrigger asChild>
                    <span className="ml-2 underline cursor-pointer text-blue-700">
                      Подробнее
                    </span>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Доставка и оплата</DialogTitle>
                      <DialogDescription>
                        Мы заботимся о том, чтобы вы получили ваш заказ как
                        можно быстрее и удобнее. Ниже вы найдете всю необходимую
                        информацию об условиях доставки.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 text-sm text-gray-800">
                      <div>
                        <p className="font-semibold">1. Способы доставки</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            Курьерская доставка по [Ваш город]: Доставка
                            осуществляется нашей курьерской службой до двери.
                          </li>
                          <li>
                            Транспортной компанией по России: Мы отправляем
                            заказы по всей России через ТК &quot;СДЭК&quot; и
                            &quot;Деловые Линии&quot; до пункта выдачи или до
                            вашего адреса.
                          </li>
                          <li>
                            Самовывоз: Вы можете забрать ваш заказ
                            самостоятельно с нашего склада по адресу: [Точный
                            адрес, включая город, улицу, дом].
                          </li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold">2. Сроки доставки</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            Сборка и передача заказа в службу доставки занимает
                            1-3 рабочих дня.
                          </li>
                          <li>
                            Срок доставки курьером по [Ваш город]: 1-2 рабочих
                            дня после передачи в доставку.
                          </li>
                          <li>
                            Срок доставки по России: от 3 до 14 рабочих дней в
                            зависимости от вашего региона.
                          </li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold">3. Стоимость доставки</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            Стоимость доставки по [Ваш город]: 500 рублей.
                          </li>
                          <li>
                            Стоимость доставки по России рассчитывается
                            индивидуально по тарифам выбранной транспортной
                            компании и будет отображена на этапе оформления
                            заказа.
                          </li>
                          <li>
                            При заказе на сумму свыше 20 000 рублей доставка
                            осуществляется бесплатно.
                          </li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold">4. Получение заказа</p>
                        <p>
                          При получении товара, пожалуйста, проверьте его
                          внешний вид и комплектность в присутствии курьера или
                          сотрудника пункта выдачи.
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </p>
            </div>
          </div>

          {/* Order Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 row-start-2 lg:row-start-auto">
            <h2 className="text-xl font-semibold mb-6">Контактные данные</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Ваше имя *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Иван Иванов"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Телефон *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="81234567890"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="deliveryType">Способ доставки *</Label>
                <select
                  id="deliveryType"
                  name="deliveryType"
                  required
                  value={formData.deliveryType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deliveryType: e.target.value as
                        | "pickup"
                        | "courier"
                        | "transport",
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="pickup">Самовывоз</option>
                  <option value="courier">Курьером</option>
                  <option value="transport">Транспортной компанией</option>
                </select>
              </div>

              {formData.deliveryType !== "pickup" && (
                <>
                  <div>
                    <Label htmlFor="city">Город *</Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Барнаул"
                      className="mt-1"
                      disabled
                    />
                  </div>

                  <div>
                    <Label htmlFor="street">Улица, дом *</Label>
                    <Input
                      id="street"
                      name="street"
                      type="text"
                      required
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="ул. Примерная, д. 1"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressDetails">
                      Квартира, подъезд, этаж
                    </Label>
                    <Input
                      id="addressDetails"
                      name="addressDetails"
                      type="text"
                      value={formData.addressDetails}
                      onChange={handleInputChange}
                      placeholder="кв. 1, подъезд 2, этаж 3"
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="comment">Комментарий к заказу</Label>
                <Textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  placeholder="Дополнительная информация..."
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Способ оплаты *</Label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  required
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentMethod: e.target.value as any,
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="card_online">Картой онлайн (ВТБ)</option>
                  <option value="cash_on_delivery">
                    Наличными при получении
                  </option>
                  <option value="card_on_delivery">Картой при получении</option>
                  <option value="b2b_invoice">
                    Счет на оплату (для юрлиц)
                  </option>
                </select>
              </div>

              <div className="mt-2">
                <div className="bg-white rounded-lg border border-gray-100 p-3">
                  <p className="text-sm text-gray-600 mb-2">
                    Принимаемые способы оплаты:
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <span className="text-sm text-blue-700 underline cursor-pointer">
                        Подробнее
                      </span>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Безопасность онлайн-платежей</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 text-sm text-gray-800">
                        <p>
                          После завершения оформления заказа в нашем магазине,
                          вы будете автоматически перенаправлены на защищенную
                          страницу платежного шлюза ПАО &quot;ВТБ&quot; для
                          ввода данных вашей банковской карты.
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            После завершения оформления заказа в нашем магазине,
                            вы будете автоматически перенаправлены на защищенную
                            страницу платежного шлюза ПАО &quot;ВТБ&quot; для
                            ввода данных вашей банковской карты.
                          </li>
                          <li>
                            Соединение с платежным шлюзом и передача информации
                            осуществляется в защищенном режиме с использованием
                            протокола шифрования SSL/TLS.
                          </li>
                          <li>
                            Все операции с вашей картой происходят на стороне
                            банка. Наш интернет-магазин не получает, не
                            обрабатывает и не хранит какие-либо данные вашей
                            банковской карты.
                          </li>
                          <li>
                            Введенные вами данные полностью защищены в
                            соответствии с требованиями стандарта безопасности
                            PCI DSS и никто, включая сотрудников нашего
                            магазина, не может их получить.
                          </li>
                        </ul>
                        <p>
                          После завершения оплаты вы будете возвращены на наш
                          сайт. Информация о вашем платеже может идти до нас от
                          5 секунд до нескольких минут. В случае возникновения
                          проблем с оплатой, пожалуйста, свяжитесь с нами.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <div className="flex items-center gap-2 mt-6">
                    <div className="h-8 w-16 flex items-center justify-center rounded-full bg-white">
                      <Image
                        src="/payment-logo/mir.png"
                        alt="Оплата картами Мир"
                        width={64}
                        height={24}
                        className="object-contain rounded-full bg-white"
                      />
                    </div>
                    <div className="h-8 w-16 flex items-center justify-center rounded-full bg-white">
                      <Image
                        src="/payment-logo/vtb.png"
                        alt="Оплата через ВТБ"
                        width={64}
                        height={24}
                        className="object-contain rounded-full bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-light-orange hover:bg-amber-500 hover:cursor-pointer rounded-full h-12 text-lg"
              >
                {isSubmitting ? "Оформление..." : "Оформить заказ"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
