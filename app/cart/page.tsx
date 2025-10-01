"use client";
import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/ui/Footer";
import { useEffect, useState } from "react";
import Link from "next/link";

const Cart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      // Mock initial cart if empty
      const mockItems = [
        {
          id: 1,
          name: "Центральный кондиционер Daikin VRV IV",
          price: 150000,
          quantity: 1,
          image: "/placeholder-ac.jpg",
        },
      ];
      setCart(mockItems);
      localStorage.setItem("cart", JSON.stringify(mockItems));
    }
  }, []);

  const removeFromCart = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const updateQuantity = (id, quantity) => {
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity } : item,
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Корзина
        </h1>
        {cart.length === 0 ? (
          <p className="text-center text-gray-600">Корзина пуста</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1 ml-4">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-600">
                    {item.price.toLocaleString()} ₽ / шт
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value))
                    }
                    className="w-16 px-2 py-1 border rounded"
                  />
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
            <div className="bg-white p-4 rounded-lg shadow-md text-right">
              <p className="text-xl font-bold">
                Итого: {total.toLocaleString()} ₽
              </p>
              <Link
                href="/order"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold mt-4 inline-block hover:bg-primary/90 transition"
              >
                Оформить заказ
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
