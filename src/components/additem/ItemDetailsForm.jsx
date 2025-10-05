import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ItemDetailsForm({ formData, onChange }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-light tracking-tight">Item Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-xs tracking-wider text-neutral-600">
            PRICE ($) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price || ""}
            onChange={(e) => onChange("price", parseFloat(e.target.value))}
            placeholder="0.00"
            className="h-12 border-neutral-200"
            required
          />
          <p className="text-xs text-neutral-500">
            Required for budget tracking
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="season" className="text-xs tracking-wider text-neutral-600">SEASON</Label>
          <Select value={formData.season || ""} onValueChange={(value) => onChange("season", value)}>
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
          <Label htmlFor="size" className="text-xs tracking-wider text-neutral-600">SIZE</Label>
          <Input
            id="size"
            value={formData.size || ""}
            onChange={(e) => onChange("size", e.target.value)}
            placeholder="e.g., M, 32, 8.5"
            className="h-12 border-neutral-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand" className="text-xs tracking-wider text-neutral-600">BRAND</Label>
          <Input
            id="brand"
            value={formData.brand || ""}
            onChange={(e) => onChange("brand", e.target.value)}
            placeholder="e.g., Nike, Zara, Uniqlo"
            className="h-12 border-neutral-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="month" className="text-xs tracking-wider text-neutral-600">PURCHASE MONTH</Label>
            <Select 
              value={formData.purchase_month?.toString() || ""} 
              onValueChange={(value) => onChange("purchase_month", parseInt(value))}
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
            <Label htmlFor="year" className="text-xs tracking-wider text-neutral-600">PURCHASE YEAR</Label>
            <Select 
              value={formData.purchase_year?.toString() || ""} 
              onValueChange={(value) => onChange("purchase_year", parseInt(value))}
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
      </CardContent>
    </Card>
  );
}