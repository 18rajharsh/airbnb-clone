import React from "react";
import {
  Palmtree,
  Tent,
  Flame,
  Crown,
  Trees,
  Building2,
  Castle,
  Waves,
  Sparkles,
} from "lucide-react";

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES = [
  { id: "all", label: "All Homes", icon: Sparkles },
  { id: "beachfront", label: "Beachfront", icon: Palmtree },
  { id: "cabins", label: "Cabins", icon: Tent },
  { id: "trending", label: "Trending", icon: Flame },
  { id: "luxe", label: "Luxe", icon: Crown },
  { id: "countryside", label: "Countryside", icon: Trees },
  { id: "iconic", label: "Iconic Cities", icon: Building2 },
  { id: "mansions", label: "Mansions", icon: Castle },
  { id: "lakefront", label: "Lakefront", icon: Waves },
];

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="border-b border-neutral-100 bg-white sticky top-[61px] z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-6 sm:gap-8 min-w-max">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected =
              selectedCategory === cat.id ||
              (!selectedCategory && cat.id === "all") ||
              (selectedCategory === "all" && cat.id === "all");

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col items-center gap-1.5 pb-2 transition-all group relative border-b-2 text-xs font-medium cursor-pointer ${
                  isSelected
                    ? "border-neutral-900 text-neutral-900 font-semibold"
                    : "border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isSelected ? "text-neutral-900 stroke-[2.2]" : "text-neutral-500"
                  }`}
                />
                <span className="whitespace-nowrap">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
