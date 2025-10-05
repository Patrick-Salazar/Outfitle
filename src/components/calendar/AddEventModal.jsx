import React, { useState } from "react";
import { CalendarEvent } from "@/api/entities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function AddEventModal({ open, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    title: "",
    event_type: "casual",
    start_date: "",
    start_time: "",
    location: "",
    description: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.title || !formData.start_date) {
      alert("Please fill in required fields");
      return;
    }

    setIsSaving(true);
    try {
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time || '12:00'}`);
      
      await CalendarEvent.create({
        title: formData.title,
        event_type: formData.event_type,
        start_date: startDateTime.toISOString(),
        location: formData.location,
        description: formData.description
      });

      setFormData({
        title: "",
        event_type: "casual",
        start_date: "",
        start_time: "",
        location: "",
        description: ""
      });
      onSaved();
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event");
    }
    setIsSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">Add New Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Client Meeting, Birthday Party"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_type">Event Type *</Label>
            <Select
              value={formData.event_type}
              onValueChange={(value) => setFormData({...formData, event_type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">💼 Work</SelectItem>
                <SelectItem value="casual">👕 Casual</SelectItem>
                <SelectItem value="formal">🎩 Formal</SelectItem>
                <SelectItem value="party">🎉 Party</SelectItem>
                <SelectItem value="date">💕 Date</SelectItem>
                <SelectItem value="sports">⚽ Sports</SelectItem>
                <SelectItem value="travel">✈️ Travel</SelectItem>
                <SelectItem value="other">📅 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time">Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="e.g., Office, Downtown Restaurant"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Any additional details..."
              className="h-24"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              CANCEL
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  SAVING...
                </>
              ) : (
                "ADD EVENT"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}