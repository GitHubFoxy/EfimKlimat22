"use client";
import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";
import Link from "next/link";

const Order = () => {
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock submit - in real app, send to backend
    console.log("Order submitted:", { formData, total });
    setSubmitted(true);
    // Clear cart
    localStorage.removeItem("cart");
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Оформление заказа
        </h1>
        {submitted ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Заказ успешно отправлен! Спасибо за покупку.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-lg shadow-md space-y-4"
            >
              <h2 className="text-xl font-semibold mb-4">Ваши данные</h2>
              <input
                type="text"
                name="name"
                placeholder="ФИО"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Телефон"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                name="address"
                placeholder="Адрес доставки"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
              >
                Подтвердить заказ
              </button>
            </form>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>
              {cart.length === 0 ? (
                <p>
                  Корзина пуста.{" "}
                  <Link
                    href="/catalog"
                    className="text-primary hover:underline"
                  >
                    Вернуться к каталогу
                  </Link>
                </p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>
                        {(item.price * item.quantity).toLocaleString()} ₽
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Итого:</span>
                      <span>{total.toLocaleString()} ₽</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Order;
