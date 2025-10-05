
import React, { useState, useEffect, useCallback } from "react";
import { ClothingItem } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Shirt, Calendar, Star } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const categoryColors = {
  hats: "#f59e0b",
  top: "#3b82f6",
  dress: "#ec4899",
  pants: "#8b5cf6",
  jacket: "#10b981",
  outerwear: "#f97316",
  shoes: "#ef4444",
  handbag: "#f43f5e"
};

const categoryIcons = {
  hats: "🎩",
  top: "👕",
  dress: "👗",
  pants: "👖",
  jacket: "🧥",
  outerwear: "🧥",
  shoes: "👟",
  handbag: "👜"
};

export default function Analytics() {
  const [items, setItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalItems: 0,
    totalSpending: 0,
    mostWorn: [],
    leastUsed: [],
    categoryBreakdown: [],
    spendingByCategory: [],
    averagePrice: 0,
    monthlySpending: []
  });

  const calculateMonthlySpending = useCallback((itemsList) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      last6Months.push({
        month: monthNames[date.getMonth()],
        spending: 0,
        key: monthKey
      });
    }

    itemsList.forEach(item => {
      if (item.purchase_year && item.purchase_month) {
        const monthKey = `${item.purchase_year}-${item.purchase_month - 1}`;
        const monthData = last6Months.find(m => m.key === monthKey);
        if (monthData) {
          monthData.spending += (item.price || 0);
        }
      }
    });

    return last6Months;
  }, []); // No dependencies for this function itself

  const calculateAnalytics = useCallback((itemsList) => {
    // Total items and spending
    const totalItems = itemsList.length;
    const totalSpending = itemsList.reduce((sum, item) => sum + (item.price || 0), 0);
    const averagePrice = totalItems > 0 ? totalSpending / totalItems : 0;

    // Most worn items (top 5)
    const mostWorn = [...itemsList]
      .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
      .slice(0, 5);

    // Least used items (items with 0 or low usage)
    const leastUsed = [...itemsList]
      .sort((a, b) => (a.usage_count || 0) - (b.usage_count || 0))
      .slice(0, 5);

    // Category breakdown (count)
    const categoryCount = {};
    itemsList.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(categoryCount).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
      color: categoryColors[category]
    }));

    // Spending by category
    const categorySpending = {};
    itemsList.forEach(item => {
      const price = item.price || 0;
      categorySpending[item.category] = (categorySpending[item.category] || 0) + price;
    });
    const spendingByCategory = Object.entries(categorySpending).map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      amount: amount,
      color: categoryColors[category]
    }));

    // Monthly spending (last 6 months)
    const monthlySpending = calculateMonthlySpending(itemsList);

    setAnalytics({
      totalItems,
      totalSpending,
      mostWorn,
      leastUsed,
      categoryBreakdown,
      spendingByCategory,
      averagePrice,
      monthlySpending
    });
  }, [calculateMonthlySpending]); // Dependency on calculateMonthlySpending

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Get all items and filter client-side to avoid Firestore index requirements
      const allItems = await ClothingItem.getAll();
      const userItems = allItems.filter(item => item.created_by === user.email);
      userItems.sort((a, b) => new Date(b.created_date || b.createdAt) - new Date(a.created_date || a.createdAt));
      setItems(userItems);

      calculateAnalytics(userItems);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [calculateAnalytics]); // Dependency on calculateAnalytics

  useEffect(() => {
    loadData();
  }, [loadData]); // Dependency on loadData

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900">
                Analytics Dashboard
              </h1>
              <p className="text-neutral-500 tracking-wide">
                Insights into your wardrobe and spending habits
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-600 tracking-wide">TOTAL ITEMS</p>
              <Shirt className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-3xl font-light text-neutral-900 mb-1">
              {analytics.totalItems}
            </p>
            <p className="text-xs text-neutral-500">
              In your wardrobe
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-0 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-600 tracking-wide">TOTAL SPENT</p>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-light text-neutral-900 mb-1">
              ${analytics.totalSpending.toFixed(2)}
            </p>
            <p className="text-xs text-neutral-500">
              All time spending
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-0 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-600 tracking-wide">AVG PRICE</p>
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-3xl font-light text-neutral-900 mb-1">
              ${analytics.averagePrice.toFixed(2)}
            </p>
            <p className="text-xs text-neutral-500">
              Per item
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-600 tracking-wide">CATEGORIES</p>
              <Star className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-3xl font-light text-neutral-900 mb-1">
              {analytics.categoryBreakdown.length}
            </p>
            <p className="text-xs text-neutral-500">
              Item types
            </p>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Category Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-light">Items by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Spending by Category */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-light">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.spendingByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="amount" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Spending Trend */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-light">Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlySpending}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="spending" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Most Worn & Least Used */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Most Worn Items */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-light">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Most Worn Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.mostWorn.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-8">
                  No usage data yet. Start viewing items to track usage!
                </p>
              ) : (
                analytics.mostWorn.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                      <img 
                        src={item.image_url} 
                        alt={item.category}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{categoryIcons[item.category]}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.category.toUpperCase()}
                        </Badge>
                      </div>
                      {item.brand && (
                        <p className="text-sm font-medium text-neutral-900">{item.brand}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <Star className="w-3 h-3 text-green-600" />
                        <span className="font-semibold">{item.usage_count || 0}</span> views
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Least Used Items */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-light">
                <TrendingDown className="w-5 h-5 text-amber-600" />
                Least Used Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.leastUsed.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-8">
                  No items yet
                </p>
              ) : (
                analytics.leastUsed.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                      <img 
                        src={item.image_url} 
                        alt={item.category}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{categoryIcons[item.category]}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.category.toUpperCase()}
                        </Badge>
                      </div>
                      {item.brand && (
                        <p className="text-sm font-medium text-neutral-900">{item.brand}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <TrendingDown className="w-3 h-3 text-amber-600" />
                        <span className="font-semibold">{item.usage_count || 0}</span> views
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
