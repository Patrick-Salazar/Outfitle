
import React, { useState } from "react";
import { DonationItem } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile, InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, AlertCircle, Sparkles, ArrowLeft, Heart } from "lucide-react";
import { motion } from "framer-motion";
import PhotoCapture from "../components/additem/PhotoCapture";

export default function DonatePage() {
  const navigate = useNavigate();
  const [capturedFile, setCapturedFile] = useState(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handlePhotoCapture = async (file) => {
    setCapturedFile(file);
    const imageUrl = URL.createObjectURL(file);
    setCapturedImageUrl(imageUrl);
    setError(null);

    setIsProcessing(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      const result = await InvokeLLM({
        prompt: `You are an expert fashion stylist and clothing classifier. Analyze this clothing item image carefully and categorize it into ONE of these specific categories: hats, top, dress, pants, jacket, outerwear, shoes, or handbag. 

Guidelines:
- hats: any headwear
- top: shirts, blouses, sweaters (not heavy outerwear)
- dress: dresses, gowns, jumpsuits
- pants: trousers, jeans, shorts, skirts, leggings
- jacket: light to medium jackets, blazers
- outerwear: heavy coats, parkas, winter jackets
- shoes: any footwear
- handbag: purses, bags, backpacks, wallets

Return ONLY the category name in lowercase.`,
        file_urls: [file_url],
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

      setDetectedCategory(result.category);
      setFormData(prev => ({ ...prev, image_url: file_url, category: result.category }));
    } catch (err) {
      setError("Failed to analyze the image. Please try again.");
      console.error(err);
    }
    setIsProcessing(false);
  };

  const handleRemovePhoto = () => {
    setCapturedFile(null);
    setCapturedImageUrl(null);
    setDetectedCategory(null);
    setFormData({});
    setError(null);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.image_url || !formData.category || !formData.title) {
      setError("Please fill in required fields (photo and title)");
      return;
    }

    setIsSaving(true);
    try {
      const user = await User.me();
      await DonationItem.create({
        ...formData,
        donor_name: user.full_name,
        donor_email: user.email,
        status: "available"
      });
      navigate(createPageUrl("Community"));
    } catch (err) {
      setError("Failed to save donation. Please try again.");
      console.error(err);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Community"))}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-4xl font-light tracking-tight text-neutral-900">
                Donate an Item
              </h1>
            </div>
            <p className="text-neutral-500 tracking-wide">
              Share your clothes with those who need them
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
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
                      Categorized as: <span className="font-semibold uppercase">{detectedCategory}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Donation Details Form */}
          <div>
            {capturedImageUrl ? (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-light tracking-tight">Donation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-xs tracking-wider text-neutral-600">
                      TITLE <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title || ""}
                      onChange={(e) => handleFormChange("title", e.target.value)}
                      placeholder="e.g., Blue Denim Jacket"
                      className="h-12 border-neutral-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs tracking-wider text-neutral-600">
                      DESCRIPTION
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => handleFormChange("description", e.target.value)}
                      placeholder="Describe the condition and any details..."
                      className="border-neutral-200 min-h-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition" className="text-xs tracking-wider text-neutral-600">
                      CONDITION
                    </Label>
                    <Select value={formData.condition || ""} onValueChange={(value) => handleFormChange("condition", value)}>
                      <SelectTrigger className="h-12 border-neutral-200">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="like_new">Like New</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size" className="text-xs tracking-wider text-neutral-600">
                      SIZE
                    </Label>
                    <Input
                      id="size"
                      value={formData.size || ""}
                      onChange={(e) => handleFormChange("size", e.target.value)}
                      placeholder="e.g., M, 32, 8.5"
                      className="h-12 border-neutral-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand" className="text-xs tracking-wider text-neutral-600">
                      BRAND
                    </Label>
                    <Input
                      id="brand"
                      value={formData.brand || ""}
                      onChange={(e) => handleFormChange("brand", e.target.value)}
                      placeholder="e.g., Nike, Zara"
                      className="h-12 border-neutral-200"
                    />
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-full text-sm tracking-wider"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        POSTING...
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5 mr-2" />
                        POST DONATION
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
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
