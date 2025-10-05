import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InvokeLLM } from "@/api/integrations";
import { Cloud, MapPin, Loader2, AlertCircle, Shirt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function WeatherWidget() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  const requestLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setHasPermission(true);
        await fetchWeatherAndSuggestions(latitude, longitude);
      },
      (error) => {
        setError("Unable to retrieve your location. Please enable location permissions.");
        setIsLoading(false);
        setHasPermission(false);
      }
    );
  };

  const fetchWeatherAndSuggestions = async (lat, lon) => {
    try {
      const result = await InvokeLLM({
        prompt: `Get the current weather and 3-day forecast for coordinates ${lat}, ${lon}. 
        
        Based on the weather conditions, suggest appropriate clothing categories from: hats, top, dress, pants, jacket, outerwear, shoes.
        
        Provide specific style recommendations (e.g., "Light jacket recommended", "Waterproof shoes advised", "Sun hat essential").
        
        Return the data in this exact format.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            location_name: { type: "string" },
            current_temp: { type: "number" },
            condition: { type: "string" },
            feels_like: { type: "number" },
            humidity: { type: "number" },
            forecast_3day: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  high: { type: "number" },
                  low: { type: "number" },
                  condition: { type: "string" }
                }
              }
            },
            clothing_suggestions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setWeather(result);
    } catch (err) {
      setError("Failed to fetch weather data. Please try again.");
      console.error(err);
    }
    setIsLoading(false);
  };

  const getWeatherEmoji = (condition) => {
    const lower = condition?.toLowerCase() || "";
    if (lower.includes("sun") || lower.includes("clear")) return "☀️";
    if (lower.includes("cloud")) return "☁️";
    if (lower.includes("rain")) return "🌧️";
    if (lower.includes("snow")) return "❄️";
    if (lower.includes("storm")) return "⛈️";
    return "🌤️";
  };

  if (!hasPermission && !isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              Get Weather-Based Outfit Suggestions
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Share your location to see personalized clothing recommendations
            </p>
            <Button
              onClick={requestLocation}
              className="bg-blue-600 hover:bg-blue-700 rounded-full"
            >
              <MapPin className="w-4 h-4 mr-2" />
              SHARE LOCATION
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-neutral-600">Fetching weather data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Unable to load weather</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <Button
            onClick={requestLocation}
            variant="outline"
            className="mt-4 w-full"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4" />
                <p className="text-sm opacity-90">{weather.location_name}</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-light">{Math.round(weather.current_temp)}°</span>
                <span className="text-2xl">{getWeatherEmoji(weather.condition)}</span>
              </div>
              <p className="text-sm opacity-90 mt-1">{weather.condition}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={requestLocation}
              className="text-white hover:bg-white/20"
            >
              Refresh
            </Button>
          </div>

          <div className="flex gap-4 text-sm">
            <div>
              <p className="opacity-75">Feels like</p>
              <p className="font-medium">{Math.round(weather.feels_like)}°</p>
            </div>
            <div>
              <p className="opacity-75">Humidity</p>
              <p className="font-medium">{weather.humidity}%</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* 3-Day Forecast */}
          <div>
            <h4 className="text-sm font-medium text-neutral-900 mb-3 tracking-wide">3-DAY FORECAST</h4>
            <div className="grid grid-cols-3 gap-3">
              {weather.forecast_3day?.map((day, index) => (
                <div key={index} className="text-center p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500 mb-1">{day.day}</p>
                  <p className="text-lg mb-1">{getWeatherEmoji(day.condition)}</p>
                  <p className="text-sm font-medium">
                    {Math.round(day.high)}° / {Math.round(day.low)}°
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Clothing Suggestions */}
          <div>
            <h4 className="text-sm font-medium text-neutral-900 mb-3 flex items-center gap-2 tracking-wide">
              <Shirt className="w-4 h-4" />
              WHAT TO WEAR
            </h4>
            <div className="space-y-2">
              {weather.clothing_suggestions?.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                  <p className="text-sm text-neutral-700">{suggestion}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}