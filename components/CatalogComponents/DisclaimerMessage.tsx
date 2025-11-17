"use client";

interface DisclaimerMessageProps {
  selectedSubcategory: string | null;
}

export default function DisclaimerMessage({
  selectedSubcategory,
}: DisclaimerMessageProps) {
  // Gas-related subcategory ID that requires disclaimer
  const GAS_SUBCATEGORY_ID = "k974vfejt24xdkaf0dvmx731957se0s5";

  if (selectedSubcategory !== GAS_SUBCATEGORY_ID) {
    return null;
  }

  return (
    <div className="px-4 mb-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-900">
        <p className="font-medium">Все цены указаны с дымоходом</p>
      </div>
    </div>
  );
}
