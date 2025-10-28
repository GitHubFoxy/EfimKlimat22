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

export default function CheckoutPage() {
  const router = useRouter();
  const sessionId = useCartSessionId();
  const itemsData = useQuery(api.cart.listItems,
    sessionId ? { sessionId } : "skip"
  );
  const summary = useQuery(api.cart.get,
    sessionId ? { sessionId } : "skip"
  );
  const clear = useMutation(api.cart.clear);
  const createOrder = useMutation(api.cart.createOrder);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    comment: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      // Create order in backend (Convex)
      const res = await createOrder({
        sessionId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        comment: formData.comment || undefined,
      });

      // Optionally ensure local cart state clears
      await clear({ sessionId });

      setOrderComplete(true);

      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);
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
            <p className="mb-6">Добавьте товары в корзину перед оформлением заказа</p>
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
              Наш менеджер свяжется с вами в ближайшее время для подтверждения заказа.
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
                  placeholder="+7 (999) 123-45-67"
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
                <Label htmlFor="address">Адрес доставки *</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="г. Барнаул, ул. Примерная, д. 1, кв. 1"
                  className="mt-1"
                />
              </div>

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

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-light-orange hover:bg-amber-500 rounded-full h-12 text-lg"
              >
                {isSubmitting ? "Оформление..." : "Оформить заказ"}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-semibold mb-6">Ваш заказ</h2>

            <div className="space-y-4 mb-6">
              {itemsData.items.map((item: any) => (
                <div key={item._id} className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
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
                      {(item.price * item.quantity).toLocaleString("ru-RU")} руб.
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
                <strong>Обратите внимание:</strong> Стоимость доставки будет рассчитана
                менеджером и сообщена вам при подтверждении заказа.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
