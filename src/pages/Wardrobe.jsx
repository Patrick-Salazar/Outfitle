import React, { useState, useEffect } from "react";
import { ClothingItem } from "@/api/entities";
import { User } from "@/api/entities";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ClothingCard from "../components/wardrobe/ClothingCard";
import CategoryFilter from "../components/wardrobe/CategoryFilter";
import ItemDetailModal from "../components/wardrobe/ItemDetailModal";
import WeatherWidget from "../components/wardrobe/WeatherWidget";
import { useLanguage } from "../components/LanguageProvider";

export default function WardrobePage() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      console.log('Loading items for user:', user.email);

      // Get all items and filter client-side (to avoid Firestore index requirement)
      const allItems = await ClothingItem.getAll();
      const userItems = allItems.filter(item => item.created_by === user.email);

      // Sort by created_date descending
      userItems.sort((a, b) => new Date(b.created_date || b.createdAt) - new Date(a.created_date || a.createdAt));

      console.log('Loaded items:', userItems);
      setItems(userItems);
    } catch (error) {
      console.error('Error loading items:', error);
      // If error, just show empty list
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryCounts = () => {
    const counts = {};
    items.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  };

  const filteredItems = activeCategory === "all" 
    ? items 
    : items.filter(item => item.category === activeCategory);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleItemUpdated = () => {
    setModalOpen(false);
    setSelectedItem(null);
    loadItems();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-neutral-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900 mb-2">
                {t("wardrobeTitle")}
              </h1>
              <p className="text-neutral-500 tracking-wide">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your collection
              </p>
            </div>
            
            <Link to={createPageUrl("AddItem")}>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-8 h-14 text-lg font-medium"
              >
                <Plus className="w-6 h-6 mr-2" />
                ADD NEW ITEM
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <WeatherWidget />
        </div>

        <div className="mb-8">
          <CategoryFilter 
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            counts={getCategoryCounts()}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-neutral-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">👔</span>
            </div>
            <h3 className="text-xl font-light text-neutral-900 mb-2">
              {activeCategory === "all" ? t("noItemsYet") : t("noCategoryItemsYet", { category: activeCategory })}
            </h3>
            <p className="text-neutral-500 mb-6">
              {t("startBuildingWardrobe")}
            </p>
            <Link to={createPageUrl("AddItem")}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                ADD YOUR FIRST ITEM
              </Button>
            </Link>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            <AnimatePresence>
              {filteredItems.map((item) => (
                <ClothingCard 
                  key={item.id} 
                  item={item}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <ItemDetailModal 
        item={selectedItem}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpdate={handleItemUpdated}
      />
    </div>
  );
}