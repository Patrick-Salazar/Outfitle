import React, { useState, useEffect } from "react";
import { ClothingItem } from "@/api/entities";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, DollarSign, Tag, Ruler, Edit, Save, X, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

const categoryColors = {
  hats: "bg-amber-100 text-amber-800 border-amber-200",
  top: "bg-blue-100 text-blue-800 border-blue-200",
  dress: "bg-pink-100 text-pink-800 border-pink-200",
  pants: "bg-purple-100 text-purple-800 border-purple-200",
  jacket: "bg-green-100 text-green-800 border-green-200",
  outerwear: "bg-orange-100 text-orange-800 border-orange-200",
  shoes: "bg-red-100 text-red-800 border-red-200",
  handbag: "bg-rose-100 text-rose-800 border-rose-200"
};

const seasonNames = {
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
  winter: "Winter",
  all_season: "All Season"
};

export default function ItemDetailModal({ item, open, onClose, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        brand: item.brand || "",
        size: item.size || "",
        price: item.price || 0,
        purchase_year: item.purchase_year || null,
        purchase_month: item.purchase_month || null,
        season: item.season || ""
      });
      setIsEditing(false);
      setError(null);
    }
  }, [item]);

  if (!item) return null;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: monthNames[i] }));

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await ClothingItem.update(item.id, formData);
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError("Failed to update item. Please try again.");
      console.error(err);
    }

    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await ClothingItem.delete(item.id);
      onClose();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError("Failed to delete item. Please try again.");
      console.error(err);
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-light tracking-tight">Item Details</DialogTitle>
            {!isEditing ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  EDIT
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                >
                  {isDeleting ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Trash2 className="w-4 h-4" />
                      </motion.div>
                      DELETING...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      DELETE
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      brand: item.brand || "",
                      size: item.size || "",
                      price: item.price || 0,
                      purchase_year: item.purchase_year || null,
                      purchase_month: item.purchase_month || null,
                      season: item.season || ""
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  CANCEL
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isSaving ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Save className="w-4 h-4" />
                      </motion.div>
                      SAVING...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      SAVE
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Image */}
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-neutral-100">
            <img 
              src={item.image_url} 
              alt={item.category}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={`${categoryColors[item.category]} border text-sm`}>
                {item.category.toUpperCase()}
              </Badge>
              {(isEditing ? formData.season : item.season) && (
                <Badge variant="outline" className="text-sm">
                  {seasonNames[isEditing ? formData.season : item.season]}
                </Badge>
              )}
            </div>

            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider text-neutral-600">SEASON</Label>
                  <Select value={formData.season || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, season: value }))}>
                    <SelectTrigger className="h-12 border-neutral-200">
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spring">🌸 Spring</SelectItem>
                      <SelectItem value="summer">☀️ Summer</SelectItem>
                      <SelectItem value="fall">🍂 Fall</SelectItem>
                      <SelectItem value="winter">❄️ Winter</SelectItem>
                      <SelectItem value="all_season">🔄 All Season</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs tracking-wider text-neutral-600">BRAND</Label>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <Tag className="w-5 h-5 text-neutral-400" />
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="e.g., Nike, Zara"
                      className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs tracking-wider text-neutral-600">SIZE</Label>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <Ruler className="w-5 h-5 text-neutral-400" />
                    <Input
                      value={formData.size}
                      onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                      placeholder="e.g., M, 32, 8.5"
                      className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs tracking-wider text-neutral-600">PRICE ($)</Label>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <DollarSign className="w-5 h-5 text-neutral-400" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider text-neutral-600">PURCHASE MONTH</Label>
                    <Select 
                      value={formData.purchase_month?.toString() || ""} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, purchase_month: parseInt(value) }))}
                    >
                      <SelectTrigger className="h-12 border-neutral-200">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map(month => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider text-neutral-600">PURCHASE YEAR</Label>
                    <Select 
                      value={formData.purchase_year?.toString() || ""} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, purchase_year: parseInt(value) }))}
                    >
                      <SelectTrigger className="h-12 border-neutral-200">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            ) : (
              <>
                {item.brand && (
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <Tag className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-xs text-neutral-500 tracking-wide">BRAND</p>
                      <p className="font-medium text-neutral-900">{item.brand}</p>
                    </div>
                  </div>
                )}

                {item.size && (
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <Ruler className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-xs text-neutral-500 tracking-wide">SIZE</p>
                      <p className="font-medium text-neutral-900">{item.size}</p>
                    </div>
                  </div>
                )}

                {item.price && (
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-xs text-neutral-500 tracking-wide">PURCHASE PRICE</p>
                      <p className="font-medium text-neutral-900">${item.price}</p>
                    </div>
                  </div>
                )}

                {(item.purchase_year || item.purchase_month) && (
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-xs text-neutral-500 tracking-wide">PURCHASED</p>
                      <p className="font-medium text-neutral-900">
                        {item.purchase_month && monthNames[item.purchase_month - 1]} {item.purchase_year}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {!isEditing && (
            <Button 
              onClick={onClose}
              className="w-full bg-neutral-900 hover:bg-neutral-800"
            >
              CLOSE
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}