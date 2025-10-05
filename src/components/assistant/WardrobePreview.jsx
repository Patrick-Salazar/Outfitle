import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shirt } from "lucide-react";

export default function WardrobePreview({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
      <div className="flex items-center gap-2 mb-3">
        <Shirt className="w-4 h-4 text-purple-600" />
        <p className="text-sm font-medium text-purple-900">From your wardrobe:</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {items.slice(0, 6).map((item) => (
          <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-white">
            <img 
              src={item.image_url} 
              alt={item.category}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute bottom-1 right-1 text-[10px] px-1 py-0">
              {item.category}
            </Badge>
          </div>
        ))}
      </div>
      {items.length > 6 && (
        <p className="text-xs text-purple-700 mt-2 text-center">
          +{items.length - 6} more items
        </p>
      )}
    </Card>
  );
}