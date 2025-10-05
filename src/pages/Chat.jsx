
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Conversation } from "@/api/entities";
import { ChatMessage } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Loader2, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function ChatPage() {
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null); // otherUser will now be a full User object
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Get conversation ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const conversationId = urlParams.get("id");

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    const msgs = await ChatMessage.filter({ conversation_id: conversationId }, "created_date");
    setMessages(msgs);
  }, [conversationId]);

  const loadChat = useCallback(async () => {
    if (!conversationId) return;
    
    setIsLoading(true);
    const user = await User.me(); // Assume User.me() returns a user object with profile_image_url
    setCurrentUser(user);

    const conv = await Conversation.filter({ id: conversationId });
    if (conv.length > 0) {
      setConversation(conv[0]);
      
      // Find the other participant's email
      const otherEmail = conv[0].participant_emails.find(email => email !== user.email);
      
      if (otherEmail) {
        // Fetch the full user object for the other participant
        const otherUserResult = await User.filter({ email: otherEmail });
        if (otherUserResult.length > 0) {
          setOtherUser(otherUserResult[0]); // Set the full user object, including profile_image_url
        } else {
          // Fallback if other user's full profile can't be found
          const otherName = conv[0].participant_names[conv[0].participant_emails.indexOf(otherEmail)];
          setOtherUser({ email: otherEmail, name: otherName, profile_image_url: null }); // Set a partial user object with null image
        }
      } else {
        // Handle case where other user email isn't found (e.g., self-chat or invalid data)
        setOtherUser(null); // No other user to display profile for
      }
    }

    await loadMessages();
    setIsLoading(false);
  }, [conversationId, loadMessages]);

  useEffect(() => {
    if (conversationId) {
      loadChat();
      
      // Poll for new messages every 3 seconds
      pollIntervalRef.current = setInterval(() => {
        loadMessages();
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [conversationId, loadChat, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);
    const messageText = inputValue.trim();
    setInputValue("");

    try {
      await ChatMessage.create({
        conversation_id: conversationId,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        message: messageText,
        is_read: false
      });

      // Update conversation's last message
      await Conversation.update(conversationId, {
        last_message: messageText,
        last_message_time: new Date().toISOString()
      });

      await loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setIsSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600 mb-4">Conversation not found</p>
          <Button onClick={() => navigate(createPageUrl("Community"))}>
            Back to Community
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <Card className="mb-6 border-0 shadow-lg">
          <div className="p-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl("Community"))}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <Avatar className="w-10 h-10">
              {otherUser?.profile_image_url ? (
                <img src={otherUser.profile_image_url} alt={otherUser.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                  {otherUser?.name?.[0]?.toUpperCase() || <UserIcon className="w-5 h-5" />}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1">
              <h2 className="font-semibold text-neutral-900">{otherUser?.name || "User"}</h2>
              <p className="text-sm text-neutral-500">About: {conversation.donation_item_title}</p>
            </div>
          </div>
        </Card>

        {/* Messages */}
        <Card className="border-0 shadow-lg mb-6">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((msg) => {
                const isCurrentUser = msg.sender_email === currentUser.email;
                // Determine profile image based on sender
                const senderProfileImage = isCurrentUser ? currentUser.profile_image_url : otherUser?.profile_image_url;
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isCurrentUser && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        {senderProfileImage ? (
                          <img src={senderProfileImage} alt={msg.sender_name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white text-sm">
                            {msg.sender_name?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    )}

                    <div className={`max-w-[70%] ${isCurrentUser ? 'order-first' : ''}`}>
                      <Card className={`p-3 ${
                        isCurrentUser 
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0' 
                          : 'bg-white border-neutral-200'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      </Card>
                      <p className={`text-xs text-neutral-400 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                        {format(new Date(msg.created_date), 'h:mm a')}
                      </p>
                    </div>

                    {isCurrentUser && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        {senderProfileImage ? (
                          <img src={senderProfileImage} alt={currentUser.full_name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <AvatarFallback className="bg-neutral-200 text-neutral-600 text-sm">
                            {currentUser.full_name?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-neutral-200 p-4">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 h-12 border-neutral-200"
                disabled={isSending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isSending}
                className="h-12 px-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-full"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
