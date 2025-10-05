import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Briefcase, PartyPopper, Coffee, GraduationCap, Plane, Heart } from "lucide-react";

const quickActions = [
  { label: "Work Meeting", icon: Briefcase, query: "I have a work meeting. Show me outfit options from my wardrobe" },
  { label: "Party/Event", icon: PartyPopper, query: "I'm going to a party. What should I wear from my closet?" },
  { label: "Coffee Chat", icon: Coffee, query: "I'm meeting someone for coffee. Suggest a casual outfit" },
  { label: "Graduation", icon: GraduationCap, query: "I'm attending a graduation ceremony. Help me pick an outfit" },
  { label: "Travel", icon: Plane, query: "I'm planning to travel. What clothes should I pack?" },
  { label: "Date Night", icon: Heart, query: "I'm going on a date. Show me romantic outfit ideas" },
];

export default function QuickActions({ onSelect }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-500 text-center">Quick suggestions:</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Button
              variant="outline"
              onClick={() => onSelect(action.query)}
              className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
            >
              <action.icon className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}