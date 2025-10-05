
import React, { useState, useEffect, useCallback } from "react";
import { ClothingItem } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { DollarSign, AlertTriangle, TrendingUp, Save, Loader2, CheckCircle2 } from "lucide-react";

const categories = [
  { id: "hats", label: "Hats", icon: "🎩" },
  { id: "top", label: "Tops", icon: "👕" },
  { id: "dress", label: "Dresses", icon: "👗" },
  { id: "pants", label: "Pants", icon: "👖" },
  { id: "jacket", label: "Jackets", icon: "🧥" },
  { id: "outerwear", label: "Outerwear", icon: "🧥" },
  { id: "shoes", label: "Shoes", icon: "👟" },
  { id: "handbag", label: "Handbags", icon: "👜" }
];

export default function SpendingAlert() {
  const [currentUser, setCurrentUser] = useState(null);
  const [items, setItems] = useState([]);
  const [budgetEnabled, setBudgetEnabled] = useState(false);
  const [budgetPeriod, setBudgetPeriod] = useState("monthly");
  const [totalBudget, setTotalBudget] = useState(0);
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [spending, setSpending] = useState({});

  const calculateSpending = useCallback((itemsList, period) => {
    const now = new Date();
    const startDate = new Date();
    
    if (period === "weekly") {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    const periodItems = itemsList.filter(item => {
      const itemDate = new Date(item.created_date);
      return itemDate >= startDate;
    });

    const spendingData = {
      total: 0,
      categories: {}
    };

    categories.forEach(cat => {
      spendingData.categories[cat.id] = 0;
    });

    periodItems.forEach(item => {
      const price = item.price || 0;
      spendingData.total += price;
      spendingData.categories[item.category] = (spendingData.categories[item.category] || 0) + price;
    });

    setSpending(spendingData);
  }, []); // `setSpending` is a stable setter, `categories` is a constant, no other dependencies

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      setBudgetEnabled(user.budget_enabled || false);
      setBudgetPeriod(user.budget_period || "monthly");
      setTotalBudget(user.budget_total || 0);

      const budgets = {};
      categories.forEach(cat => {
        budgets[cat.id] = user[`budget_${cat.id}`] || 0;
      });
      setCategoryBudgets(budgets);

      // Get all items and filter client-side to avoid Firestore index requirements
      const allItems = await ClothingItem.getAll();
      const userItems = allItems.filter(item => item.created_by === user.email);
      userItems.sort((a, b) => new Date(b.created_date || b.createdAt) - new Date(a.created_date || a.createdAt));
      setItems(userItems);
      calculateSpending(userItems, user.budget_period || "monthly");
    } catch (error) {
      console.error('Error loading budget data:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [calculateSpending]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    const updateData = {
      budget_enabled: budgetEnabled,
      budget_period: budgetPeriod,
      budget_total: totalBudget
    };

    categories.forEach(cat => {
      updateData[`budget_${cat.id}`] = categoryBudgets[cat.id] || 0;
    });

    await User.updateMyUserData(updateData);
    await loadData();
    
    setSuccessMessage("Budget settings saved successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
    setIsSaving(false);
  };

  const handleCategoryBudgetChange = (categoryId, value) => {
    setCategoryBudgets(prev => ({
      ...prev,
      [categoryId]: parseFloat(value) || 0
    }));
  };

  const getSpendingPercentage = (spent, budget) => {
    if (budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-amber-500";
    return "bg-green-500";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900">
                Spending Alert
              </h1>
              <p className="text-neutral-500 tracking-wide">
                Track and manage your clothing budget
              </p>
            </div>
          </div>

          {successMessage && (
            <Alert className="bg-green-50 border-green-200 mb-6">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-600 tracking-wide">TOTAL SPENT</p>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-3xl font-light text-neutral-900 mb-1">
              ${spending.total?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-neutral-500">
              This {budgetPeriod === 'weekly' ? 'week' : 'month'}
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-0 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-600 tracking-wide">BUDGET</p>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-light text-neutral-900 mb-1">
              ${totalBudget?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-neutral-500">
              {budgetPeriod === 'weekly' ? 'Weekly' : 'Monthly'} limit
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-0 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-600 tracking-wide">REMAINING</p>
              <Save className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-3xl font-light text-neutral-900 mb-1">
              ${Math.max(0, (totalBudget || 0) - (spending.total || 0)).toFixed(2)}
            </p>
            <p className="text-xs text-neutral-500">
              {((totalBudget - (spending.total || 0)) / totalBudget * 100).toFixed(0)}% left
            </p>
          </Card>
        </div>

        {/* Budget Progress */}
        {budgetEnabled && totalBudget > 0 && (
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-light">Overall Budget Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">
                    ${spending.total?.toFixed(2) || '0.00'} of ${totalBudget?.toFixed(2)}
                  </span>
                  <span className={`font-semibold ${
                    spending.total >= totalBudget ? 'text-red-600' : 
                    spending.total >= totalBudget * 0.8 ? 'text-amber-600' : 
                    'text-green-600'
                  }`}>
                    {getSpendingPercentage(spending.total, totalBudget).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={getSpendingPercentage(spending.total, totalBudget)} 
                  className="h-3"
                />
                {spending.total >= totalBudget && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      You've exceeded your {budgetPeriod} budget by ${(spending.total - totalBudget).toFixed(2)}!
                    </AlertDescription>
                  </Alert>
                )}
                {spending.total >= totalBudget * 0.8 && spending.total < totalBudget && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      You're approaching your budget limit. ${(totalBudget - spending.total).toFixed(2)} remaining.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-light">Budget Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Enable Spending Alerts</Label>
                <p className="text-xs text-neutral-500">
                  Get notified when approaching budget limits
                </p>
              </div>
              <Switch
                checked={budgetEnabled}
                onCheckedChange={setBudgetEnabled}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="budgetPeriod" className="text-sm font-medium">
                  Budget Period
                </Label>
                <Select value={budgetPeriod} onValueChange={setBudgetPeriod}>
                  <SelectTrigger className="h-12 border-neutral-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalBudget" className="text-sm font-medium">
                  Total Budget ($)
                </Label>
                <Input
                  id="totalBudget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                  className="h-12 border-neutral-200"
                  placeholder="0.00"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-neutral-900 hover:bg-neutral-800 rounded-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  SAVING...
                </>
              ) : (
                "SAVE SETTINGS"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Category Budgets */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-light">Category Budgets</CardTitle>
            <p className="text-sm text-neutral-500">
              Set spending limits for each clothing category
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {categories.map((category) => {
                const categorySpending = spending.categories?.[category.id] || 0;
                const categoryBudget = categoryBudgets[category.id] || 0;
                const percentage = getSpendingPercentage(categorySpending, categoryBudget);

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 p-4 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{category.icon}</span>
                        <Label className="text-sm font-medium">{category.label}</Label>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={categoryBudgets[category.id] || 0}
                        onChange={(e) => handleCategoryBudgetChange(category.id, e.target.value)}
                        className="w-28 h-9"
                        placeholder="0.00"
                      />
                    </div>
                    
                    {categoryBudget > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-neutral-600">
                          <span>${categorySpending.toFixed(2)} spent</span>
                          <span className={`font-semibold ${
                            categorySpending >= categoryBudget ? 'text-red-600' : 
                            categorySpending >= categoryBudget * 0.8 ? 'text-amber-600' : 
                            'text-green-600'
                          }`}>
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(percentage)}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
