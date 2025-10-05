import React from "react";
import { motion } from "framer-motion";
import { Calendar, DollarSign, Tag, Ruler } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClothingItem } from "@/api/entities";

const categoryColors = {
  hats: "bg-amber-100 text-amber-800 border-amber-200",
  top: "bg-blue-100 text-blue-800 border-blue-200",
  dress: "bg-pink-100 text-pink-800 border-pink-200",
  pants: "bg-purple-100 text-purple-800 border-purple-200",
  jacket: "bg-green-100 text-green-800 border-green-200",
  outerwear: "bg-orange-100 text-orange-800 border-orange-200",
  shoes: "bg-red-100 text-red-800 border-red-200",
  handbag: "bg-rose-100 text-rose-800 border-rose-200"
};

const seasonIcons = {
  spring: "🌸",
  summer: "☀️",
  fall: "🍂",
  winter: "❄️",
  all_season: "🔄"
};

export default function ClothingCard({ item, onClick }) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const handleClick = async () => {
    // Track usage
    await ClothingItem.update(item.id, {
      last_used: new Date().toISOString(),
      usage_count: (item.usage_count || 0) + 1
    });
    
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-300 group">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
          <img 
            src={item.image_url} 
            alt={item.category}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3">
            <Badge className={`${categoryColors[item.category]} border backdrop-blur-sm`}>
              {item.category.toUpperCase()}
            </Badge>
          </div>
          {item.season && (
            <div className="absolute top-3 left-3 text-2xl backdrop-blur-sm bg-white/80 w-10 h-10 rounded-full flex items-center justify-center">
              {seasonIcons[item.season]}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">
          {item.brand && (
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-sm font-medium text-neutral-900 tracking-wide">{item.brand}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-neutral-500">
            {item.size && (
              <div className="flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" />
                <span className="tracking-wide">SIZE {item.size}</span>
              </div>
            )}
            {item.price && (
              <div className="flex items-center gap-1.5 font-medium text-neutral-900">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{item.price}</span>
              </div>
            )}
          </div>

          {(item.purchase_year || item.purchase_month) && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Calendar className="w-3.5 h-3.5" />
              <span className="tracking-wide">
                {item.purchase_month && monthNames[item.purchase_month - 1]} {item.purchase_year}
              </span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}