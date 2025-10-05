import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Shirt } from "lucide-react";
import { motion } from "framer-motion";

const categoryColors = {
  hats: "bg-amber-100 text-amber-800",
  top: "bg-blue-100 text-blue-800",
  dress: "bg-pink-100 text-pink-800",
  pants: "bg-purple-100 text-purple-800",
  jacket: "bg-green-100 text-green-800",
  outerwear: "bg-orange-100 text-orange-800",
  shoes: "bg-red-100 text-red-800",
  handbag: "bg-rose-100 text-rose-800"
};

export default function OutfitSuggestion({ items, outfitName }) {
  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <div>
              <p className="text-white font-medium">
                {outfitName || "Suggested Outfit"}
              </p>
              <p className="text-white/80 text-xs">
                From your wardrobe • {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="p-4">
          <div className={`grid gap-3 ${items.length === 1 ? 'grid-cols-1' : items.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="group"
              >
                <Card className="overflow-hidden bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                  {/* Image */}
                  <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={`${categoryColors[item.category]} text-[10px] px-2 py-0.5`}>
                        {item.category.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-2">
                    {item.brand && (
                      <p className="text-xs font-medium text-neutral-900 truncate">
                        {item.brand}
                      </p>
                    )}
                    {item.size && (
                      <p className="text-[10px] text-neutral-500">
                        Size {item.size}
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Styling Tip */}
          <div className="mt-3 p-3 bg-white/60 rounded-lg border border-purple-200">
            <div className="flex items-start gap-2">
              <Shirt className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-700">
                These items work great together! Mix and match with accessories to personalize your look.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}