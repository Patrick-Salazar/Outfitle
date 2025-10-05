
import React, { useState, useEffect, useCallback } from "react";
import { ClothingItem } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile, InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, AlertCircle, Sparkles, ArrowLeft, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import PhotoCapture from "../components/additem/PhotoCapture";
import ItemDetailsForm from "../components/additem/ItemDetailsForm";

export default function AddItem() {
  const navigate = useNavigate();
  const [capturedFile, setCapturedFile] = useState(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [budgetWarning, setBudgetWarning] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await User.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const checkBudget = useCallback(async () => {
    if (!currentUser?.budget_enabled) {
      setBudgetWarning(null);
      return;
    }

    const price = parseFloat(formData.price) || 0;
    if (price === 0) {
      setBudgetWarning(null);
      return;
    }

    // Calculate current period spending - only for current user
    const now = new Date();
    const startDate = new Date();
    if (currentUser.budget_period === "weekly") {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    // Filter to only get current user's items
    const items = await ClothingItem.filter({ created_by: currentUser.email }, "-created_date");
    const periodItems = items.filter(item => {
      const itemDate = new Date(item.created_date);
      return itemDate >= startDate;
    });

    const currentSpending = periodItems.reduce((sum, item) => sum + (item.price || 0), 0);
    const categorySpending = periodItems
      .filter(item => item.category === formData.category)
      .reduce((sum, item) => sum + (item.price || 0), 0);

    const totalBudget = currentUser.budget_total || 0;
    const categoryBudget = currentUser[`budget_${formData.category}`] || 0;

    const newTotalSpending = currentSpending + price;
    const newCategorySpending = categorySpending + price;

    // Check if adding this item would exceed budgets
    if (totalBudget > 0 && newTotalSpending > totalBudget) {
      setBudgetWarning({
        type: "error",
        message: `This purchase would exceed your ${currentUser.budget_period} budget by $${(newTotalSpending - totalBudget).toFixed(2)}!`
      });
    } else if (totalBudget > 0 && newTotalSpending > totalBudget * 0.8) {
      setBudgetWarning({
        type: "warning",
        message: `This purchase will bring you to ${((newTotalSpending / totalBudget) * 100).toFixed(0)}% of your ${currentUser.budget_period} budget.`
      });
    } else if (categoryBudget > 0 && newCategorySpending > categoryBudget) {
      setBudgetWarning({
        type: "warning",
        message: `This purchase exceeds your ${formData.category} budget by $${(newCategorySpending - categoryBudget).toFixed(2)}.`
      });
    } else {
      setBudgetWarning(null);
    }
  }, [currentUser, formData.price, formData.category]); // Added formData.price and formData.category to dependencies

  useEffect(() => {
    if (formData.price && formData.category && currentUser) {
      checkBudget();
    }
  }, [formData.price, formData.category, currentUser, checkBudget]); // Added checkBudget to dependencies

  const handlePhotoCapture = async (file) => {
    setCapturedFile(file);
    const imageUrl = URL.createObjectURL(file);
    setCapturedImageUrl(imageUrl);
    setError(null);

    // Auto-detect category with Gemini 2.0
    setIsProcessing(true);
    try {
      console.log('Step 1: Converting image to base64...');

      // Convert file to base64 for AI analysis (avoid CORS issues)
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Image = await base64Promise;
      console.log('Step 2: Image converted to base64');

      console.log('Step 3: Calling Gemini 2.0 AI for image analysis...');
      const result = await InvokeLLM({
        prompt: `You are an expert fashion stylist and clothing classifier. Analyze this clothing item image carefully and categorize it into ONE of these specific categories.

CATEGORY DEFINITIONS:

1. **hats** - Any headwear including:
   - Baseball caps, snapbacks, dad hats
   - Beanies, winter hats, knit caps
   - Fedoras, sun hats, bucket hats
   - Visors, headbands worn as hats

2. **top** - Upper body garments (NOT outerwear):
   - T-shirts, long sleeve shirts, tank tops
   - Blouses, button-ups, polo shirts
   - Sweaters, cardigans, hoodies, sweatshirts
   - Crop tops, tube tops
   - Vests (fashion vests, not outerwear)

3. **dress** - One-piece garments:
   - All types of dresses (maxi, mini, midi, cocktail)
   - Gowns, evening dresses
   - Jumpsuits, rompers, overalls (worn as single piece)
   - Sundresses, shirt dresses

4. **pants** - Lower body garments:
   - Jeans, denim pants, trousers
   - Shorts, bermudas, cargo pants
   - Skirts (all lengths and styles)
   - Leggings, yoga pants, joggers
   - Sweatpants, track pants

5. **jacket** - Light to medium outerwear:
   - Denim jackets, jean jackets
   - Blazers, sport coats
   - Bomber jackets, varsity jackets
   - Light windbreakers
   - Leather jackets (not heavy)
   - Suit jackets

6. **outerwear** - Heavy weather protection:
   - Winter coats, parkas, puffer jackets
   - Trench coats, raincoats
   - Heavy overcoats, peacoats
   - Ski jackets, snowboard jackets
   - Down jackets (heavy winter)

7. **shoes** - All footwear:
   - Sneakers, running shoes, athletic shoes
   - Boots (all types), heels, sandals
   - Dress shoes, loafers, oxfords
   - Slippers, flip-flops, slides

8. **handbag** - Bags and accessories:
   - Purses, handbags, shoulder bags
   - Tote bags, clutches, crossbody bags
   - Backpacks (fashion backpacks)
   - Wallets, coin purses (if primary item)

DECISION RULES:
- If it's worn on the head → hats
- If it's a single full-body piece → dress
- If it covers feet → shoes
- If it's a bag or purse → handbag
- If it's heavy winter wear → outerwear
- If it's a lighter jacket/blazer → jacket
- If it's upper body casual/everyday wear → top
- If it's lower body wear → pants

Focus on the PRIMARY function and weight of the garment. When in doubt between jacket and outerwear, consider: would you wear this in freezing weather as your main protection? If yes → outerwear, if no → jacket.

Return ONLY the category name in lowercase.`,
        base64_images: [base64Image],
        response_json_schema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["hats", "top", "dress", "pants", "jacket", "outerwear", "shoes", "handbag"]
            }
          }
        }
      });

      console.log('Step 4: Analysis complete:', result);

      // Now upload the file to Firebase Storage
      console.log('Step 5: Uploading to Firebase Storage...');
      const uploadResult = await UploadFile({ file });
      const file_url = uploadResult.file_url || uploadResult.url;

      console.log('Step 6: Upload complete, setting form data');
      setDetectedCategory(result.category);
      setFormData(prev => ({ ...prev, image_url: file_url, category: result.category }));
    } catch (err) {
      console.error('Image analysis error:', err);
      setError("AI detection failed. Please manually select a category.");
    }
    setIsProcessing(false);
  };

  const handleRemovePhoto = () => {
    setCapturedFile(null);
    setCapturedImageUrl(null);
    setDetectedCategory(null);
    setFormData({});
    setError(null);
    setBudgetWarning(null);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Check if we have a captured file or image URL
    if (!capturedFile && !formData.image_url) {
      setError("Please capture or upload a photo first");
      return;
    }

    if (!formData.category) {
      setError("Please select a category");
      return;
    }

    if (!formData.price || formData.price === 0) {
      setError("Please enter the purchase price");
      return;
    }

    setIsSaving(true);
    try {
      // If we have a captured file but no image_url (analysis failed), upload it now
      let finalImageUrl = formData.image_url;
      if (capturedFile && !formData.image_url) {
        const { file_url } = await UploadFile({ file: capturedFile });
        finalImageUrl = file_url;
      }

      console.log('Saving item to Firestore...');
      await ClothingItem.create({
        ...formData,
        image_url: finalImageUrl,
        created_by: currentUser.email,
        created_date: new Date().toISOString()
      });
      console.log('Item saved successfully!');
      navigate(createPageUrl("Wardrobe"));
    } catch (err) {
      console.error('Error saving item:', err);
      setError("Failed to save item: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Wardrobe"))}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-light tracking-tight text-neutral-900">
              Add New Item
            </h1>
            <p className="text-neutral-500 tracking-wide mt-1">
              Capture and organize your wardrobe
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {budgetWarning && (
          <Alert className={`mb-6 ${budgetWarning.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
            <AlertTriangle className={`h-4 w-4 ${budgetWarning.type === 'error' ? 'text-red-600' : 'text-amber-600'}`} />
            <AlertDescription className={budgetWarning.type === 'error' ? 'text-red-800' : 'text-amber-800'}>
              {budgetWarning.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Photo Capture */}
          <div>
            <PhotoCapture
              onPhotoCapture={handlePhotoCapture}
              capturedImage={capturedImageUrl}
              onRemove={handleRemovePhoto}
            />

            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100"
              >
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Analyzing image...</p>
                    <p className="text-xs text-blue-600">Detecting clothing category</p>
                  </div>
                </div>
              </motion.div>
            )}

            {detectedCategory && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Category detected!</p>
                    <p className="text-xs text-green-600">
                      This item was categorized as: <span className="font-semibold uppercase">{detectedCategory}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Item Details Form */}
          <div>
            {capturedImageUrl ? (
              <>
                <ItemDetailsForm formData={formData} onChange={handleFormChange} />
                
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !formData.price}
                  className="w-full mt-6 h-12 bg-neutral-900 hover:bg-neutral-800 rounded-full text-sm tracking-wider"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      SAVING...
                    </>
                  ) : (
                    "ADD TO WARDROBE"
                  )}
                </Button>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-8 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200">
                <div className="text-center">
                  <p className="text-neutral-400 text-sm tracking-wide">
                    Capture or upload a photo to continue
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
