"use client";

interface Tab {
  id: string;
  label: string;
}

interface TabNavProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TabNav({
  tabs,
  activeTab,
  onTabChange,
}: TabNavProps) {
  return (
    <div className="border-b border-yellow-100 bg-white">
      <div className="flex gap-8 px-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-yellow-400 text-gray-900"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
