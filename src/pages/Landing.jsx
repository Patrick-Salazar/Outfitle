
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shirt, Sparkles, Heart, Camera, TrendingUp, Users, LogIn } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      await User.me();
      // User is logged in, redirect to wardrobe
      navigate(createPageUrl("Wardrobe"));
    } catch (error) {
      // User is not logged in, show landing page
      setIsCheckingAuth(false);
    }
  }, [navigate]); // navigate is a dependency because it's used inside checkAuth

  useEffect(() => {
    checkAuth();
  }, [checkAuth]); // checkAuth is a dependency because it's called inside useEffect

  const handleSignIn = async () => {
    try {
      console.log('Starting sign in...');
      await User.login();
      console.log('Sign in successful!');
      navigate(createPageUrl("Wardrobe"));
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Sign in failed: ' + error.message);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-neutral-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-2xl flex items-center justify-center">
                <Shirt className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-5xl md:text-6xl font-light tracking-tight text-neutral-900">
                  Outfitle
                </h1>
                <p className="text-sm text-neutral-500 tracking-[0.3em] uppercase">
                  Virtual Wardrobe
                </p>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-light text-neutral-800 mb-6 leading-tight"
            >
              Your Personal Style Assistant
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto"
            >
              Organize your wardrobe, get AI-powered outfit suggestions, and join a community of fashion enthusiasts
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={handleSignIn}
                className="h-14 px-8 text-lg bg-neutral-900 hover:bg-neutral-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In with Google
              </Button>
              <p className="text-sm text-neutral-500 mt-4">
                Free to use • No credit card required
              </p>
            </motion.div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Capture</h3>
                <p className="text-sm text-neutral-600">
                  Take photos of your clothes and let AI automatically categorize them
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Style Assistant</h3>
                <p className="text-sm text-neutral-600">
                  Get personalized outfit recommendations for any occasion
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Weather Integration</h3>
                <p className="text-sm text-neutral-600">
                  Get weather-based clothing suggestions for your location
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Donation Community</h3>
                <p className="text-sm text-neutral-600">
                  Give your clothes a second life and help others in need
                </p>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-sm text-neutral-600">
              © 2024 Outfitle. Built with ❤️ for fashion lovers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
