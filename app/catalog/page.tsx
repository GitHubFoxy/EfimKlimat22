"use client";

import { Footer } from "@/components/Footer";
import FreeConsultmant from "@/components/FreeConsultmant";
import Header from "@/components/Header/header";
import HeaderSearch from "@/components/Header/HeaderSearch";
import { useState } from "react";

export default function Catalog() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    agreed: false,
  });

  const products = [
    {
      id: 1,
      name: "Электрокотел Куппер Спутник-12 (2.0) черный",
      price: "21 970 руб.",
      rating: 0,
      image: "/kotel.png",
    },
    {
      id: 2,
      name: "Электрокотел Куппер Спутник-12 (2.0) белый",
      price: "21 970 руб.",
      rating: 5,
      image: "/kotel.png",
    },
    {
      id: 3,
      name: "Котел Куппер ПРАКТИК-20 (1.1)",
      price: "43 080 руб.",
      rating: 4,
      image: "/kotel.png",
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3 h-3 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="px-6 py-2 md:px-12 lg:px-28 xl:max-w-[1280px] xl:mx-auto">
      {/* Header */}
      <Header />

      {/* Search Bar */}
      {/* Ensure header search scales on desktop as well */}
      <HeaderSearch />

      {/* Product Cards */}
      <div className="px-4 mb-8">
        {/* Responsive grid: 1col mobile, 2col tablet, 3–4col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100"
            >
              <div className="p-4 md:p-5">
                {/* Product Image */}
                <div className="w-full h-32 md:h-40 lg:h-48 bg-gray-100 rounded-3xl mb-3 flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain"
                  />
                </div>

                {/* Rating */}
                <div className="mb-2">{renderStars(product.rating)}</div>

                {/* Product Info */}
                <div className="mb-3">
                  <h3 className="text-xs md:text-sm lg:text-base text-gray-800 mb-1 leading-tight font-normal">
                    {product.name}
                  </h3>
                  <p className="text-xs md:text-sm lg:text-base font-medium text-gray-800">
                    {product.price}
                  </p>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="px-4 pb-4">
                <button className="w-full bg-blue-600 text-white text-xs md:text-sm font-medium py-3 md:py-3.5 rounded-3xl hover:bg-blue-700 transition-colors">
                  В корзину
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="px-4 mb-6">
        <hr className="border-gray-300" />
      </div>

      {/* Consultation Section */}
      <FreeConsultmant />

      {/* Divider */}
      <div className="px-4 mb-6">
        <hr className="border-gray-300" />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
