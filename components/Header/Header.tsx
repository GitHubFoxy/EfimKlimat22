"use client";
import { Phone as PhoneNumber } from "@/lib/consts";
import { DesktopHeader } from "./DesktopHeader";
import { MobileHeader } from "./MobileHeader";

export default function Header() {
  return (
    <div className="mb-6">
      <div className="block min-[730px]:hidden">
        <MobileHeader PhoneNumber={PhoneNumber} />
      </div>
      <div className="hidden min-[730px]:block">
        <DesktopHeader PhoneNumber={PhoneNumber} />
      </div>
    </div>
  );
}
