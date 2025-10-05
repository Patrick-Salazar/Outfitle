import React, { useState } from "react";
import { CalendarEvent } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Sparkles, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";

const eventTypeColors = {
  work: "bg-blue-100 text-blue-800 border-blue-200",
  casual: "bg-green-100 text-green-800 border-green-200",
  formal: "bg-purple-100 text-purple-800 border-purple-200",
  party: "bg-pink-100 text-pink-800 border-pink-200",
  date: "bg-rose-100 text-rose-800 border-rose-200",
  sports: "bg-orange-100 text-orange-800 border-orange-200",
  travel: "bg-cyan-100 text-cyan-800 border-cyan-200",
  other: "bg-neutral-100 text-neutral-800 border-neutral-200"
};

const eventTypeEmojis = {
  work: "💼",
  casual: "👕",
  formal: "🎩",
  party: "🎉",
  date: "💕",
  sports: "⚽",
  travel: "✈️",
  other: "📅"
};

export default function EventCard({ event, onUpdate, isPast = false }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateOutfit = async () => {
    setIsGenerating(true);
    try {
      const response = await InvokeLLM({
        prompt: `You are a professional stylist. Generate an outfit recommendation for this event:

Event: ${event.title}
Type: ${event.event_type}
Date: ${format(new Date(event.start_date), 'PPPP')}
${event.location ? `Location: ${event.location}` : ''}
${event.description ? `Details: ${event.description}` : ''}

Provide a specific outfit recommendation considering:
1. The event type and formality level
2. The season and expected weather
3. Current fashion trends
4. Color coordination and style tips

Keep it concise (2-3 sentences) and actionable.`,
        add_context_from_internet: true
      });

      await CalendarEvent.update(event.id, {
        outfit_suggestion: response
      });

      onUpdate();
    } catch (error) {
      console.error("Error generating outfit:", error);
    }
    setIsGenerating(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this event?")) {
      await CalendarEvent.delete(event.id);
      onUpdate();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${isPast ? 'opacity-60' : ''}`}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{eventTypeEmojis[event.event_type]}</div>
              <div>
                <h3 className="text-lg font-medium text-neutral-900">{event.title}</h3>
                <Badge className={`${eventTypeColors[event.event_type]} text-xs mt-1`}>
                  {event.event_type.toUpperCase()}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="text-neutral-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-neutral-600">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(event.start_date), 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(event.start_date), 'p')}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-neutral-600">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {event.description && (
            <p className="text-sm text-neutral-600">{event.description}</p>
          )}

          {event.outfit_suggestion ? (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-900 tracking-wide">
                  OUTFIT SUGGESTION
                </span>
              </div>
              <p className="text-sm text-neutral-700">{event.outfit_suggestion}</p>
            </div>
          ) : !isPast && (
            <Button
              onClick={handleGenerateOutfit}
              disabled={isGenerating}
              variant="outline"
              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  GENERATING...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  GET OUTFIT SUGGESTION
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}