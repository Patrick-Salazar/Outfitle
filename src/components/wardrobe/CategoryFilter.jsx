import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../LanguageProvider";

const categories = [
  { id: "all", labelKey: "allItems", icon: "👔" },
  { id: "hats", labelKey: "hats", icon: "🎩" },
  { id: "top", labelKey: "tops", icon: "👕" },
  { id: "dress", labelKey: "dresses", icon: "👗" },
  { id: "pants", labelKey: "pants", icon: "👖" },
  { id: "jacket", labelKey: "jackets", icon: "🧥" },
  { id: "outerwear", labelKey: "outerwear", icon: "🧥" },
  { id: "shoes", labelKey: "shoes", icon: "👟" },
  { id: "handbag", labelKey: "handbags", icon: "👜" }
];

export default function CategoryFilter({ activeCategory, onCategoryChange, counts }) {
  const { t } = useLanguage();
  
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {categories.map((category) => {
        const count = category.id === "all" 
          ? Object.values(counts).reduce((sum, c) => sum + c, 0)
          : counts[category.id] || 0;
        
        return (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            onClick={() => onCategoryChange(category.id)}
            className={`relative whitespace-nowrap px-4 py-2 transition-all duration-300 ${
              activeCategory === category.id
                ? "bg-neutral-900 text-white hover:bg-neutral-800"
                : "bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-200"
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            <span className="text-xs font-medium tracking-wider">{t(category.labelKey)}</span>
            {count > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                activeCategory === category.id
                  ? "bg-white text-neutral-900"
                  : "bg-neutral-100 text-neutral-600"
              }`}>
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}