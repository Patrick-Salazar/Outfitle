
import React, { useState, useEffect } from "react";
import { ClothingItem } from "@/api/entities";
import { DonationItem } from "@/api/entities";
import { User } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Heart, Calendar, TrendingDown, Settings, Loader2, CheckCircle2 } from "lucide-react";

export default function DonationReminder() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [unusedItems, setUnusedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [reminderDays, setReminderDays] = useState(90);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      setReminderDays(user.donation_reminder_days || 90);
      setReminderEnabled(user.reminder_enabled !== false);

      // Get all items and filter client-side to avoid Firestore index requirements
      const allItems = await ClothingItem.getAll();
      const userItems = allItems.filter(item => item.created_by === user.email);
      userItems.sort((a, b) => new Date(b.created_date || b.createdAt) - new Date(a.created_date || a.createdAt));
      setItems(userItems);

      // Calculate unused items
      const now = new Date();
      const cutoffDays = user.donation_reminder_days || 90;
      const unused = userItems.filter(item => {
        if (!item.last_used) {
          // If never used, check if it's old enough based on creation date
          const daysSinceCreation = Math.floor((now - new Date(item.created_date)) / (1000 * 60 * 60 * 24));
          return daysSinceCreation > cutoffDays;
        }
        const daysSinceUse = Math.floor((now - new Date(item.last_used)) / (1000 * 60 * 60 * 24));
        return daysSinceUse > cutoffDays;
      });
      setUnusedItems(unused);
    } catch (error) {
      console.error('Error loading donation reminder data:', error);
      setItems([]);
      setUnusedItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await User.updateMyUserData({
      donation_reminder_days: reminderDays,
      reminder_enabled: reminderEnabled
    });
    await loadData();
    setSuccessMessage("Settings saved successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
    setIsSaving(false);
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleDonateSelected = async () => {
    if (selectedItems.length === 0) return;

    setIsDonating(true);
    const itemsToDonate = items.filter(item => selectedItems.includes(item.id));
    
    for (const item of itemsToDonate) {
      await DonationItem.create({
        image_url: item.image_url,
        category: item.category,
        title: `${item.brand || 'Quality'} ${item.category}`,
        description: `Size: ${item.size || 'N/A'}. Gently used, ready for a new home!`,
        size: item.size,
        brand: item.brand,
        condition: "good",
        donor_name: currentUser.full_name,
        donor_email: currentUser.email,
        status: "available"
      });
      await ClothingItem.delete(item.id);
    }

    setSuccessMessage(`Successfully donated ${selectedItems.length} items!`);
    setSelectedItems([]);
    await loadData();
    setIsDonating(false);
  };

  const getDaysSinceLastUse = (item) => {
    const now = new Date();
    if (!item.last_used) {
      return Math.floor((now - new Date(item.created_date)) / (1000 * 60 * 60 * 24));
    }
    return Math.floor((now - new Date(item.last_used)) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900">
                Donation Reminder
              </h1>
              <p className="text-neutral-500 tracking-wide">
                Items you haven't worn in a while • Give them a new home
              </p>
            </div>
          </div>

          {successMessage && (
            <Alert className="bg-green-50 border-green-200 mb-6">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Settings Card */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-light">
              <Settings className="w-5 h-5" />
              Reminder Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Enable Donation Reminders</Label>
                <p className="text-xs text-neutral-500">
                  Get notified about items you haven't used
                </p>
              </div>
              <Switch
                checked={reminderEnabled}
                onCheckedChange={setReminderEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminderDays" className="text-sm font-medium">
                Remind me after (days)
              </Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="reminderDays"
                  type="number"
                  min="30"
                  max="365"
                  value={reminderDays}
                  onChange={(e) => setReminderDays(parseInt(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm text-neutral-600">
                  days without using an item
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Suggested: 90 days (3 months) • Typical: 60-180 days
              </p>
            </div>

            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-neutral-900 hover:bg-neutral-800 rounded-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  SAVING...
                </>
              ) : (
                "SAVE SETTINGS"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 p-6">
            <p className="text-3xl font-light text-neutral-900 mb-1">
              {items.length}
            </p>
            <p className="text-sm text-neutral-600 tracking-wide">Total Items</p>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-0 p-6">
            <p className="text-3xl font-light text-neutral-900 mb-1">
              {unusedItems.length}
            </p>
            <p className="text-sm text-neutral-600 tracking-wide">Unused Items</p>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 p-6">
            <p className="text-3xl font-light text-neutral-900 mb-1">
              {reminderDays}
            </p>
            <p className="text-sm text-neutral-600 tracking-wide">Days Threshold</p>
          </Card>
          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-0 p-6">
            <p className="text-3xl font-light text-neutral-900 mb-1">
              {selectedItems.length}
            </p>
            <p className="text-sm text-neutral-600 tracking-wide">Selected</p>
          </Card>
        </div>

        {/* Action Bar */}
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-r from-pink-500 to-rose-500">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="text-white">
                  <p className="text-lg font-medium">
                    {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
                  </p>
                  <p className="text-sm opacity-90">
                    Ready to donate to the community
                  </p>
                </div>
                <Button
                  onClick={handleDonateSelected}
                  disabled={isDonating}
                  className="bg-white text-pink-600 hover:bg-neutral-50 rounded-full px-6"
                >
                  {isDonating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      DONATING...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      DONATE SELECTED
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Unused Items Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
        ) : unusedItems.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-light text-neutral-900 mb-2">
                All items are in use!
              </h3>
              <p className="text-neutral-500 mb-6">
                You're making great use of your wardrobe. Check back in {reminderDays} days.
              </p>
              <Link to={createPageUrl("Wardrobe")}>
                <Button variant="outline" className="rounded-full">
                  VIEW MY WARDROBE
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-light text-neutral-900">
                Items Not Used Recently
              </h2>
              <Button
                onClick={() => setSelectedItems(unusedItems.map(i => i.id))}
                variant="outline"
                className="rounded-full"
              >
                SELECT ALL
              </Button>
            </div>

            <motion.div 
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              <AnimatePresence>
                {unusedItems.map((item) => {
                  const daysSince = getDaysSinceLastUse(item);
                  const isSelected = selectedItems.includes(item.id);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{ y: -4 }}
                      className="cursor-pointer"
                      onClick={() => toggleItemSelection(item.id)}
                    >
                      <Card className={`overflow-hidden transition-all duration-300 ${
                        isSelected 
                          ? 'ring-4 ring-pink-500 shadow-xl' 
                          : 'border-0 shadow-sm hover:shadow-xl'
                      }`}>
                        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                          <img 
                            src={item.image_url} 
                            alt={item.category}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-pink-500/20 backdrop-blur-[1px] flex items-center justify-center">
                              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          )}
                          <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0">
                            <Calendar className="w-3 h-3 mr-1" />
                            {daysSince}d ago
                          </Badge>
                        </div>
                        <div className="p-4 space-y-2">
                          {item.brand && (
                            <p className="font-medium text-neutral-900 tracking-wide text-sm">
                              {item.brand}
                            </p>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {item.category.toUpperCase()}
                          </Badge>
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <TrendingDown className="w-3 h-3" />
                            <span>
                              {item.usage_count || 0} {item.usage_count === 1 ? 'view' : 'views'}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
