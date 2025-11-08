"use client";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function FreeConsultmant() {
  const [isChecked, setIsChecked] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showNameError, setShowNameError] = useState(false);
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitConsultant = useMutation(
    api.consultants.submit_consultant_request,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasErrors = false;

    if (!name.trim()) {
      setShowNameError(true);
      hasErrors = true;
    } else {
      setShowNameError(false);
    }

    if (!phone.trim()) {
      setShowPhoneError(true);
      hasErrors = true;
    } else {
      setShowPhoneError(false);
    }

    if (!isChecked) {
      setShowValidationError(true);
      hasErrors = true;
    } else {
      setShowValidationError(false);
    }

    if (hasErrors) {
      return;
    }

    try {
      setSubmitting(true);
      await submitConsultant({ name, phone });
      setShowDialog(true);
      setName("");
      setPhone("");
      setIsChecked(false);
    } catch (err) {
      console.error("Failed to submit consultant request:", err);
      alert("Не удалось отправить заявку. Попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setIsChecked(checked);
    if (checked) {
      setShowValidationError(false);
    }
  };

  return (
    <section id="free-consultant">
      <div className="mb-6 flex flex-col md:border-b md:border-t md:grid md:grid-cols-2 md:mb-[120px]">
        <div className="md:border-r md:py-[36px] pb-4">
          <h1 className="text-[14px] md:text-3xl font-medium md:border-b md:pb-[24px] w-[20ch]">
            Получите бесплатную консультацию
          </h1>
          <p className="text-[12px] md:text-base font-normal pt-[12px] md:pt-[90px] w-[42ch]">
            Не знаете какое оборудование лучше всего подойдёт для Вас? Наш
            менеджер поможет Вам.
          </p>
        </div>
        <div className="md:p-4 py-2 md:grid md:place-content-center">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div
              className={`border-b ${showNameError ? "border-red-500" : ""}`}
            >
              <Input
                placeholder="Ваше имя"
                className="outline-none border-none shadow-none placeholder:text-dark-gray"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) {
                    setShowNameError(false);
                  }
                }}
              />
            </div>
            <div
              className={`border-b ${showPhoneError ? "border-red-500" : ""}`}
            >
              <Input
                placeholder="Ваш телефон"
                className="outline-none border-none shadow-none placeholder:text-dark-gray"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (e.target.value.trim()) {
                    setShowPhoneError(false);
                  }
                }}
              />
            </div>
            <div className="flex gap-2 items-center justify-center">
              <Checkbox
                className={`w-5 h-5 cursor-pointer ${
                  showValidationError
                    ? "border-red-500 data-[state=unchecked]:border-red-500"
                    : ""
                }`}
                checked={isChecked}
                onCheckedChange={handleCheckboxChange}
              />
              <Label
                className={`font-inter font-normal text-sm ${
                  showValidationError ? "text-red-500" : ""
                }`}
              >
                Нажимая кнопку Вы соглашаетесь с Политикой конфиденциальности
              </Label>
            </div>
            <Button
              disabled={submitting}
              className="bg-light-orange h-[58px] rounded-full mt-4 cursor-pointer"
            >
              Отправить
            </Button>
          </form>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="p-12">
            <DialogHeader>
              <DialogTitle>Заявка отправлена!</DialogTitle>
            </DialogHeader>
            <p>
              Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее
              время.
            </p>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
