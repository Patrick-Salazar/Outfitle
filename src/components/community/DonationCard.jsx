
import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Tag, Ruler, User } from "lucide-react";

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

const conditionColors = {
  like_new: "bg-green-100 text-green-800",
  good: "bg-blue-100 text-blue-800",
  fair: "bg-yellow-100 text-yellow-800"
};

const conditionLabels = {
  like_new: "Like New",
  good: "Good",
  fair: "Fair"
};

export default function DonationCard({ item, onContact }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-300 group">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
          <img 
            src={item.image_url} 
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Badge className={`${categoryColors[item.category]} border backdrop-blur-sm`}>
              {item.category.toUpperCase()}
            </Badge>
            <Badge className={`${conditionColors[item.condition]} backdrop-blur-sm`}>
              {conditionLabels[item.condition]}
            </Badge>
          </div>
          {item.status === "claimed" && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Badge className="bg-white text-neutral-900 text-lg px-4 py-2">
                CLAIMED
              </Badge>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">
          <h3 className="font-medium text-neutral-900 tracking-wide">{item.title}</h3>
          
          {item.description && (
            <p className="text-sm text-neutral-600 line-clamp-2">{item.description}</p>
          )}

          <div className="flex items-center justify-between text-xs text-neutral-500">
            {item.brand && (
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span className="tracking-wide">{item.brand}</span>
              </div>
            )}
            {item.size && (
              <div className="flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" />
                <span className="tracking-wide">SIZE {item.size}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400 pt-2 border-t border-neutral-100">
            <User className="w-3.5 h-3.5" />
            <span>Donated by {item.donor_name || "Anonymous"}</span>
          </div>

          {item.status === "available" && (
            <Button
              onClick={() => onContact(item)}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-full text-sm"
              aria-label={`Message donor for ${item.title}`}
            >
              <Mail className="w-4 h-4 mr-2" />
              MESSAGE DONOR
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
