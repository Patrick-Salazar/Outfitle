import React, { useState, useEffect } from "react";
import { CalendarEvent } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus, Loader2, MapPin, Clock, Sparkles, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EventCard from "../components/calendar/EventCard";
import AddEventModal from "../components/calendar/AddEventModal";
import CalendarView from "../components/calendar/CalendarView";
import { useLanguage } from "../components/LanguageProvider";
import { googleCalendarEvents, transformGoogleCalendarEvents, isCalendarAuthenticated } from "@/api/googleCalendar";

export default function MyEventsPage() {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "calendar"

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Get all events and filter client-side to avoid Firestore index requirements
      const allEvents = await CalendarEvent.getAll();
      const userEvents = allEvents.filter(event => event.created_by === user.email);
      userEvents.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      setEvents(userEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = () => {
    setShowAddModal(true);
  };

  const handleEventSaved = () => {
    setShowAddModal(false);
    loadEvents();
  };

  const handleImportGoogleCalendar = async () => {
    try {
      if (!isCalendarAuthenticated()) {
        alert('Please sign in with Google to access your calendar. Sign out and sign in again to grant calendar permissions.');
        return;
      }

      setIsLoading(true);

      // Get events from next 30 days
      const now = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(now.getDate() + 30);

      const result = await googleCalendarEvents(
        now.toISOString(),
        thirtyDaysLater.toISOString()
      );

      if (result.success && result.events.length > 0) {
        const transformedEvents = transformGoogleCalendarEvents(result.events);

        // Save each event to Firestore
        const user = await User.me();
        let importedCount = 0;

        for (const event of transformedEvents) {
          // Check if event already exists by google_calendar_id
          const existingEvents = events.filter(e => e.google_calendar_id === event.google_calendar_id);

          if (existingEvents.length === 0) {
            await CalendarEvent.create({
              ...event,
              created_by: user.email,
              created_date: new Date().toISOString()
            });
            importedCount++;
          }
        }

        alert(`Successfully imported ${importedCount} events from Google Calendar!`);
        loadEvents();
      } else {
        alert('No upcoming events found in your Google Calendar.');
      }
    } catch (error) {
      console.error('Error importing Google Calendar:', error);
      alert('Failed to import Google Calendar events. ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const upcomingEvents = events.filter(event => 
    new Date(event.start_date) >= new Date()
  );

  const pastEvents = events.filter(event => 
    new Date(event.start_date) < new Date()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900">
                  My Events
                </h1>
                <p className="text-neutral-500 tracking-wide">
                  Plan outfits for your upcoming events
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
                className="rounded-full"
              >
                LIST
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "outline"}
                onClick={() => setViewMode("calendar")}
                className="rounded-full"
              >
                CALENDAR
              </Button>
              <Button
                onClick={handleImportGoogleCalendar}
                variant="outline"
                className="rounded-full"
                disabled={isLoading}
              >
                <Download className="w-4 h-4 mr-2" />
                IMPORT FROM GOOGLE
              </Button>
              <Button
                onClick={handleAddEvent}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                ADD EVENT
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 p-4">
              <p className="text-2xl font-light text-neutral-900 mb-1">
                {upcomingEvents.length}
              </p>
              <p className="text-xs text-neutral-600 tracking-wide">UPCOMING EVENTS</p>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 p-4">
              <p className="text-2xl font-light text-neutral-900 mb-1">
                {events.filter(e => e.event_type === "formal").length}
              </p>
              <p className="text-xs text-neutral-600 tracking-wide">FORMAL EVENTS</p>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 p-4">
              <p className="text-2xl font-light text-neutral-900 mb-1">
                {events.filter(e => e.outfit_suggestion).length}
              </p>
              <p className="text-xs text-neutral-600 tracking-wide">OUTFITS PLANNED</p>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-0 p-4">
              <p className="text-2xl font-light text-neutral-900 mb-1">
                {pastEvents.length}
              </p>
              <p className="text-xs text-neutral-600 tracking-wide">PAST EVENTS</p>
            </Card>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
        ) : viewMode === "calendar" ? (
          <CalendarView events={events} onEventClick={(event) => {}} />
        ) : (
          <div className="space-y-8">
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-light text-neutral-900 mb-4">
                  Upcoming Events
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {upcomingEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onUpdate={loadEvents}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-light text-neutral-900 mb-4">
                  Past Events
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {pastEvents.slice(0, 4).map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onUpdate={loadEvents}
                        isPast
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Empty State */}
            {events.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-light text-neutral-900 mb-2">
                    No events yet
                  </h3>
                  <p className="text-neutral-500 mb-6">
                    Add your first event to get AI outfit recommendations
                  </p>
                  <Button
                    onClick={handleAddEvent}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    ADD YOUR FIRST EVENT
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={handleEventSaved}
      />
    </div>
  );
}