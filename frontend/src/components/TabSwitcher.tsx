import { type LucideIcon } from "lucide-react";

export interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TabSwitcherProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function TabSwitcher({ tabs, activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="flex bg-muted rounded-xl p-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 ease-smooth ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
