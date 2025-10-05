import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, User as UserIcon, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setIsLoading(true);
    const user = await User.me();
    setCurrentUser(user);
    setIsLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const { file_url } = await UploadFile({ file });
      await User.updateMyUserData({ profile_image_url: file_url });
      setCurrentUser(prev => ({ ...prev, profile_image_url: file_url }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to upload profile picture. Please try again.");
      console.error(err);
    }

    setIsUploading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-neutral-100">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900 mb-2">
            My Profile
          </h1>
          <p className="text-neutral-500 tracking-wide">
            Manage your account settings
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              Profile picture updated successfully!
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-light tracking-tight">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  {currentUser.profile_image_url ? (
                    <AvatarImage src={currentUser.profile_image_url} alt={currentUser.full_name} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl">
                      {currentUser.full_name?.[0]?.toUpperCase() || <UserIcon className="w-12 h-12" />}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <label
                  htmlFor="profile-upload"
                  className="absolute bottom-0 right-0 w-10 h-10 bg-neutral-900 hover:bg-neutral-800 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </motion.div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-medium text-neutral-900 mb-2">
                  {currentUser.full_name}
                </h2>
                <div className="flex items-center justify-center md:justify-start gap-2 text-neutral-600 mb-4">
                  <Mail className="w-4 h-4" />
                  <span>{currentUser.email}</span>
                </div>
                <p className="text-sm text-neutral-500 mb-4">
                  Click the camera icon to upload a new profile picture
                </p>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('profile-upload').click()}
                  disabled={isUploading}
                  className="rounded-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}