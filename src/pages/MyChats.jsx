
import React, { useState, useEffect } from "react";
import { Conversation } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Loader2, User as UserIcon } from "lucide-react"; // Added UserIcon
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence
import { formatDistanceToNow } from "date-fns";

export default function MyChatsPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Get all conversations where user is a participant
      const allConvs = await Conversation.getAll();
      const myConvs = allConvs.filter(conv =>
        conv.participant_emails && conv.participant_emails.includes(user.email)
      );
      // Sort by last_message_time descending
      myConvs.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));

      setConversations(myConvs);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getOtherParticipant = (conv) => {
    const otherEmail = conv.participant_emails.find(email => email !== currentUser?.email);
    const otherName = conv.participant_names[conv.participant_emails.indexOf(otherEmail)];
    return { email: otherEmail, name: otherName };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-light tracking-tight text-neutral-900">
                My Messages
              </h1>
              <p className="text-neutral-500 tracking-wide">
                Chat with donors about items
              </p>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
        ) : conversations.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-pink-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-pink-500" />
              </div>
              <h3 className="text-xl font-light text-neutral-900 mb-2">
                No messages yet
              </h3>
              <p className="text-neutral-500 mb-6">
                Start a conversation by contacting a donor
              </p>
              <Button
                onClick={() => navigate(createPageUrl("Community"))}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-full"
              >
                Browse Donations
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4"> {/* Changed space-y-3 to space-y-4 */}
            <AnimatePresence>
              {conversations.map((conv) => {
                const otherUser = getOtherParticipant(conv); // Keep using this helper function

                return (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }} // Added exit animation
                    onClick={() => navigate(`${createPageUrl("Chat")}?id=${conv.id}`)} // Moved onClick here
                    className="cursor-pointer" // Added cursor-pointer
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 border-0"> {/* Modified Card class */}
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                              {otherUser.name?.[0]?.toUpperCase() || <UserIcon className="w-6 h-6" />} {/* Updated AvatarFallback content */}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-neutral-900 truncate">
                                {otherUser.name}
                              </h3>
                              <span className="text-xs text-neutral-400">
                                {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-500 truncate mb-1">
                              About: {conv.donation_item_title}
                            </p>
                            <p className="text-sm text-neutral-600 truncate">
                              {conv.last_message}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
