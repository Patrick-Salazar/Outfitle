import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";

const eventTypeColors = {
  work: "bg-blue-100 text-blue-800",
  casual: "bg-green-100 text-green-800",
  formal: "bg-purple-100 text-purple-800",
  party: "bg-pink-100 text-pink-800",
  date: "bg-rose-100 text-rose-800",
  sports: "bg-orange-100 text-orange-800",
  travel: "bg-cyan-100 text-cyan-800",
  other: "bg-neutral-100 text-neutral-800"
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

export default function UpcomingEventsPreview({ events }) {
  if (!events || events.length === 0) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-indigo-600" />
        <p className="text-sm font-medium text-indigo-900">Your upcoming events:</p>
      </div>
      <div className="space-y-2">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-3 p-3 bg-white/80 rounded-lg">
            <div className="text-xl flex-shrink-0">{eventTypeEmojis[event.event_type]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm text-neutral-900 truncate">{event.title}</p>
                <Badge className={`${eventTypeColors[event.event_type]} text-[10px] px-1.5 py-0`}>
                  {event.event_type}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(event.start_date), 'MMM d, h:mm a')}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {events.length > 0 && (
        <p className="text-xs text-indigo-700 mt-2 text-center">
          💡 Ask me for outfit suggestions for any of these events!
        </p>
      )}
    </Card>
  );
}