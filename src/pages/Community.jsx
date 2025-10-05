
import React, { useState, useEffect } from "react";
import { DonationItem } from "@/api/entities";
import { User } from "@/api/entities";
import { Conversation } from "@/api/entities"; // Added import
import { Link, useNavigate } from "react-router-dom"; // Modified import
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, Loader2, Mail } from "lucide-react";
import DonationCard from "../components/community/DonationCard";
import CategoryFilter from "../components/wardrobe/CategoryFilter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Modified import for AlertTitle

export default function Community() {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const [contactingId, setContactingId] = useState(null);
  const [error, setError] = useState(null); // Added state for error

  const navigate = useNavigate(); // Added useNavigate hook

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Get ALL donations (community aspect - show everyone's donations)
      const data = await DonationItem.getAll();
      // Sort by created date descending
      data.sort((a, b) => new Date(b.created_date || b.createdAt) - new Date(a.created_date || a.createdAt));
      setDonations(data);
    } catch (error) {
      console.error('Error loading donations:', error);
      setDonations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryCounts = () => {
    const counts = {};
    donations.forEach(item => {
      if (item.status === "available") {
        counts[item.category] = (counts[item.category] || 0) + 1;
      }
    });
    return counts;
  };

  const filteredDonations = donations.filter(item => {
    const categoryMatch = activeCategory === "all" || item.category === activeCategory;
    return categoryMatch;
  });

  const handleContact = async (item) => {
    setContactingId(item.id);
    setError(null); // Clear any previous errors
    try {
      // Check if conversation already exists - use getAll to avoid index issues
      const allConvs = await Conversation.getAll();
      const existingConvs = allConvs.filter(conv => conv.donation_item_id === item.id);

      const myConversation = existingConvs.find(conv =>
        conv.participant_emails.includes(currentUser.email) && conv.participant_emails.includes(item.donor_email)
      );

      let conversationId;

      if (myConversation) {
        // Conversation exists, navigate to it
        conversationId = myConversation.id;
      } else {
        // Create new conversation
        const newConv = await Conversation.create({
          participant_emails: [currentUser.email, item.donor_email],
          participant_names: [currentUser.full_name, item.donor_name || "Donor"],
          donation_item_id: item.id,
          donation_item_title: item.title,
          last_message: "Started conversation",
          last_message_time: new Date().toISOString()
        });
        conversationId = newConv.id;
      }

      // Navigate to chat page
      navigate(`${createPageUrl("Chat")}?id=${conversationId}`);
    } catch (err) {
      console.error("Failed to start conversation:", err);
      setError("Failed to start conversation. Please try again.");
    }
    setContactingId(null);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900">
                  Donation Community
                </h1>
              </div>
              <p className="text-neutral-500 tracking-wide">
                Give your clothes a second life • Help others in need
              </p>
            </div>
            <Link to={createPageUrl("DonatePage")}>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                DONATE ITEM
              </Button>
            </Link>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
            <p className="text-3xl font-light text-neutral-900 mb-1">
              {donations.filter(d => d.status === "available").length}
            </p>
            <p className="text-sm text-neutral-600 tracking-wide">Available Items</p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl">
            <p className="text-3xl font-light text-neutral-900 mb-1">
              {donations.filter(d => d.status === "claimed").length}
            </p>
            <p className="text-sm text-neutral-600 tracking-wide">Items Donated</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
            <p className="text-3xl font-light text-neutral-900 mb-1">
              {new Set(donations.map(d => d.donor_email)).size}
            </p>
            <p className="text-sm text-neutral-600 tracking-wide">Donors</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl">
            <p className="text-3xl font-light text-neutral-900 mb-1">
              {donations.length}
            </p>
            <p className="text-sm text-neutral-600 tracking-wide">Total Impact</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter 
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            counts={getCategoryCounts()}
          />
        </div>

        {/* Donations Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-pink-500" />
            </div>
            <h3 className="text-xl font-light text-neutral-900 mb-2">
              No donations yet
            </h3>
            <p className="text-neutral-500 mb-6">
              Be the first to donate and help others
            </p>
            <Link to={createPageUrl("DonatePage")}>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                DONATE YOUR FIRST ITEM
              </Button>
            </Link>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            <AnimatePresence>
              {filteredDonations.map((item) => (
                <DonationCard 
                  key={item.id} 
                  item={item}
                  onContact={handleContact}
                  isContacting={contactingId === item.id}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
