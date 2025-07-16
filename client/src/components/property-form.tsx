import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { insertPropertySchema, type InsertProperty } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload } from "lucide-react";

interface PropertyFormProps {
  property?: any; // For editing existing property
  onSuccess?: () => void;
}

const amenitiesOptions = [
  { id: "wifi", label: "WiFi" },
  { id: "meals", label: "Meals Included" },
  { id: "parking", label: "Parking" },
  { id: "security", label: "24/7 Security" },
  { id: "laundry", label: "Laundry Service" },
  { id: "gym", label: "Gym/Fitness Center" },
  { id: "common_room", label: "Common Room" },
  { id: "kitchen", label: "Kitchen Access" },
  { id: "ac", label: "Air Conditioning" },
  { id: "water_purifier", label: "Water Purifier" },
  { id: "power_backup", label: "Power Backup" },
  { id: "study_room", label: "Study Room" },
];

const rulesOptions = [
  "No smoking inside premises",
  "No alcohol consumption",
  "Visitors allowed only till 10 PM",
  "Maintain cleanliness in common areas",
  "No loud music after 10 PM",
  "No pets allowed",
  "Gate closes at 11 PM",
  "Monthly rent due by 5th of every month",
];

export default function PropertyForm({ property, onSuccess }: PropertyFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(property?.amenities || []);
  const [selectedRules, setSelectedRules] = useState<string[]>(property?.rules || []);
  const [customRule, setCustomRule] = useState("");

  const form = useForm<InsertProperty>({
    resolver: zodResolver(insertPropertySchema),
    defaultValues: {
      name: property?.name || "",
      description: property?.description || "",
      address: property?.address || "",
      city: property?.city || "",
      state: property?.state || "",
      pincode: property?.pincode || "",
      propertyType: property?.propertyType || "",
      gender: property?.gender || "mixed",
      amenities: property?.amenities || [],
      rules: property?.rules || [],
      images: property?.images || [],
      isActive: property?.isActive ?? true,
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (data: InsertProperty) => {
      const response = await apiRequest("POST", "/api/properties", {
        ...data,
        amenities: selectedAmenities,
        rules: selectedRules,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Property created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      onSuccess?.();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async (data: InsertProperty) => {
      const response = await apiRequest("PUT", `/api/properties/${property.id}`, {
        ...data,
        amenities: selectedAmenities,
        rules: selectedRules,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Property updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      onSuccess?.();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProperty) => {
    if (property) {
      updatePropertyMutation.mutate(data);
    } else {
      createPropertyMutation.mutate(data);
    }
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const toggleRule = (rule: string) => {
    setSelectedRules(prev => 
      prev.includes(rule) 
        ? prev.filter(r => r !== rule)
        : [...prev, rule]
    );
  };

  const addCustomRule = () => {
    if (customRule.trim() && !selectedRules.includes(customRule.trim())) {
      setSelectedRules(prev => [...prev, customRule.trim()]);
      setCustomRule("");
    }
  };

  const removeRule = (rule: string) => {
    setSelectedRules(prev => prev.filter(r => r !== rule));
  };

  const isLoading = createPropertyMutation.isPending || updatePropertyMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {property ? "Edit Property" : "Add New Property"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter property name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single_room">Single Room</SelectItem>
                          <SelectItem value="shared_room">Shared Room</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="hostel">Hostel</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your property, its features, and what makes it special"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address Information</h3>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Address *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter complete address with landmark"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter pincode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Gender Preference */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mixed">Co-ed (Mixed)</SelectItem>
                        <SelectItem value="male">Male Only</SelectItem>
                        <SelectItem value="female">Female Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenitiesOptions.map((amenity) => (
                    <div
                      key={amenity.id}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAmenities.includes(amenity.id)
                          ? "border-primary bg-primary/10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleAmenity(amenity.id)}
                    >
                      <Checkbox 
                        checked={selectedAmenities.includes(amenity.id)}
                        onChange={() => toggleAmenity(amenity.id)}
                      />
                      <span className="text-sm">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">House Rules</h3>
                <div className="space-y-3">
                  {rulesOptions.map((rule) => (
                    <div
                      key={rule}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedRules.includes(rule)
                          ? "border-primary bg-primary/10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleRule(rule)}
                    >
                      <Checkbox 
                        checked={selectedRules.includes(rule)}
                        onChange={() => toggleRule(rule)}
                      />
                      <span className="text-sm">{rule}</span>
                    </div>
                  ))}
                </div>

                {/* Custom Rule Input */}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add custom rule"
                    value={customRule}
                    onChange={(e) => setCustomRule(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomRule())}
                  />
                  <Button type="button" onClick={addCustomRule} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Selected Custom Rules */}
                {selectedRules.filter(rule => !rulesOptions.includes(rule)).length > 0 && (
                  <div className="space-y-2">
                    <Label>Custom Rules:</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedRules
                        .filter(rule => !rulesOptions.includes(rule))
                        .map((rule) => (
                          <Badge key={rule} variant="secondary" className="flex items-center gap-1">
                            {rule}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeRule(rule)}
                            />
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Images</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Image upload functionality will be implemented in the next version
                  </p>
                  <p className="text-sm text-gray-500">
                    For now, property images will use placeholder images
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? "Saving..." : property ? "Update Property" : "Create Property"}
                </Button>
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
