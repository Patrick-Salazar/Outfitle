
import React, { useState, useEffect, useRef } from "react";
import { ClothingItem } from "@/api/entities";
import { CalendarEvent } from "@/api/entities";
import { User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Sparkles, RotateCcw, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import ChatMessage from "../components/assistant/ChatMessage";
import QuickActions from "../components/assistant/QuickActions";
import WardrobePreview from "../components/assistant/WardrobePreview";
import UpcomingEventsPreview from "../components/assistant/UpcomingEventsPreview";

export default function StyleAssistant() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [conversationContext, setConversationContext] = useState([]);
  const messagesEndRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
    initChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Load user's wardrobe items (get all and filter client-side)
      const allItems = await ClothingItem.getAll();
      const userItems = allItems.filter(item => item.created_by === user.email);
      userItems.sort((a, b) => new Date(b.created_date || b.createdAt) - new Date(a.created_date || a.createdAt));
      setWardrobeItems(userItems);

      // Load user's upcoming events (get all and filter client-side)
      const allEvents = await CalendarEvent.getAll();
      const userEvents = allEvents.filter(event => event.created_by === user.email);
      const upcoming = userEvents.filter(event => new Date(event.start_date) >= new Date());
      upcoming.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      setUpcomingEvents(upcoming.slice(0, 5)); // Get next 5 events
    } catch (error) {
      console.error('Error loading data:', error);
      setWardrobeItems([]);
      setUpcomingEvents([]);
    }
  };

  const initChat = () => {
    setMessages([
      {
        text: "Hi! I'm your personal style assistant 👋\n\nI can see your wardrobe and upcoming events! Tell me:\n\n• What's the occasion?\n• How would you like to feel?\n• Any specific style preferences?\n\nI'll suggest outfits from your wardrobe and recommend items you can purchase if needed!",
        isUser: false,
        type: 'text'
      }
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const buildWardrobeSummary = () => {
    const categories = {};
    wardrobeItems.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push({
        brand: item.brand,
        size: item.size,
        season: item.season
      });
    });

    return Object.entries(categories)
      .map(([cat, items]) => `${cat}: ${items.length} items${items[0]?.brand ? ` (brands: ${[...new Set(items.map(i => i.brand).filter(Boolean))].join(', ')})` : ''}`)
      .join('\n');
  };

  const buildEventsSummary = () => {
    if (upcomingEvents.length === 0) {
      return "No upcoming events scheduled.";
    }

    return upcomingEvents.map(event => {
      const date = format(new Date(event.start_date), 'EEEE, MMMM d, yyyy');
      const time = format(new Date(event.start_date), 'h:mm a');
      return `• ${event.title} - ${event.event_type} event on ${date} at ${time}${event.location ? ` (Location: ${event.location})` : ''}${event.description ? ` - ${event.description}` : ''}`;
    }).join('\n');
  };

  const buildDetailedWardrobeList = () => {
    return wardrobeItems.map(item => ({
      id: item.id,
      category: item.category,
      brand: item.brand || 'No brand',
      size: item.size || 'N/A',
      season: item.season || 'all_season',
      image_url: item.image_url
    }));
  };

  const handleSendMessage = async (messageText = inputValue) => {
    if (!messageText.trim()) return;

    const userMessage = messageText.trim();
    setMessages(prev => [...prev, { text: userMessage, isUser: true, type: 'text' }]);
    setInputValue("");
    setIsLoading(true);

    const newContext = [...conversationContext, { role: "user", content: userMessage }];
    setConversationContext(newContext);

    try {
      const contextString = newContext.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
      const wardrobeList = buildDetailedWardrobeList();
      
      const response = await InvokeLLM({
        prompt: `You are a professional fashion stylist and personal shopping assistant.

USER'S COMPLETE WARDROBE:
${JSON.stringify(wardrobeList, null, 2)}

Total items: ${wardrobeItems.length}

USER'S UPCOMING EVENTS:
${buildEventsSummary()}

CONVERSATION HISTORY:
${contextString}

IMPORTANT: When suggesting outfits from the user's wardrobe:
1. Reference SPECIFIC items by their ID from the wardrobe list above
2. For each suggested item, include its ID so we can show the actual photo
3. Suggest complete outfits with multiple items when appropriate
4. Consider the event type, weather, and user's preferences

RESPONSE FORMAT:
When recommending items from their wardrobe, structure your response as:
- Text explanation/conversation
- If suggesting specific items, include them in a "suggested_items" array with IDs

For items they don't own, provide shopping links: [Item name](https://www.amazon.com/s?k=search+terms)

YOUR ROLE:
- Be conversational and friendly
- Consider their calendar events proactively
- Mix and match items from their wardrobe creatively
- Provide styling tips (tuck in, layer, accessorize)
- Offer both wardrobe items AND shopping suggestions
- Consider weather, season, and occasion

Respond naturally and be specific about which items to wear!`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Your conversational response to the user"
            },
            suggested_items: {
              type: "array",
              items: {
                type: "string"
              },
              description: "Array of item IDs from the user's wardrobe that you're suggesting"
            },
            outfit_name: {
              type: "string",
              description: "A catchy name for the suggested outfit (e.g., 'Professional Chic', 'Casual Friday Vibes')"
            }
          }
        }
      });

      const assistantMessage = response.message || "I'm here to help! Could you tell me more about the occasion?";
      const suggestedItemIds = response.suggested_items || [];
      const outfitName = response.outfit_name || null;
      
      // Get the actual items from wardrobe
      const suggestedItems = wardrobeItems.filter(item => 
        suggestedItemIds.includes(item.id)
      );

      setMessages(prev => [...prev, { 
        text: assistantMessage,
        isUser: false,
        type: suggestedItems.length > 0 ? 'outfit' : 'text',
        items: suggestedItems,
        outfitName: outfitName
      }]);
      
      setConversationContext(prev => [...prev, { 
        role: "assistant", 
        content: assistantMessage 
      }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { 
        text: "I apologize, I encountered an issue. Could you rephrase your question?", 
        isUser: false,
        type: 'text'
      }]);
    }

    setIsLoading(false);
  };

  const handleQuickAction = (query) => {
    handleSendMessage(query);
  };

  const handleReset = () => {
    setMessages([]);
    setConversationContext([]);
    initChat();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-light tracking-tight text-neutral-900">
                  AI Style Assistant
                </h1>
                <p className="text-neutral-500 tracking-wide">
                  Your personal fashion advisor
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              className="rounded-full"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Wardrobe Preview */}
          {wardrobeItems.length > 0 && (
            <WardrobePreview items={wardrobeItems} />
          )}

          {/* Upcoming Events Preview */}
          {upcomingEvents.length > 0 && (
            <UpcomingEventsPreview events={upcomingEvents} />
          )}
        </div>

        {/* Chat Container */}
        <Card className="border-0 shadow-xl mb-6">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message.text}
                  isUser={message.isUser}
                  type={message.type}
                  items={message.items}
                  outfitName={message.outfitName}
                />
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 justify-start"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <Card className="p-4 bg-white border-neutral-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span className="text-sm text-neutral-600">Styling your look...</span>
                  </div>
                </Card>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (show only at start) */}
          {messages.length <= 1 && !isLoading && (
            <div className="px-6 pb-6">
              <QuickActions onSelect={handleQuickAction} />
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-neutral-200 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-3"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Describe your occasion, style, or ask for advice..."
                className="flex-1 h-12 border-neutral-200"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="h-12 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-full"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </form>
            <p className="text-xs text-neutral-400 mt-2 text-center">
              💡 Tip: I can see your wardrobe and calendar events to give you better suggestions
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
