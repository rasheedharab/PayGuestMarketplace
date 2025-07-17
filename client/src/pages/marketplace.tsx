import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import SearchForm from "@/components/search-form";
import PropertyCard from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Wifi, Utensils, Car, Dumbbell, SlidersHorizontal } from "lucide-react";

export default function Marketplace() {
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    propertyType: "all",
    budget: "any",
    amenities: [] as string[],
  });

  const { data: properties, isLoading, error } = useQuery({
    queryKey: ["/api/properties", searchFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchFilters.location) params.append("search", searchFilters.location);
      if (searchFilters.propertyType && searchFilters.propertyType !== "all") {
        params.append("propertyType", searchFilters.propertyType);
      }
      if (searchFilters.budget && searchFilters.budget !== "any") {
        const [min, max] = searchFilters.budget.split("-");
        if (min) params.append("minPrice", min);
        if (max) params.append("maxPrice", max);
      }
      if (searchFilters.amenities.length > 0) {
        params.append("amenities", searchFilters.amenities.join(","));
      }
      
      const response = await fetch(`/api/properties?${params}`);
      if (!response.ok) throw new Error("Failed to fetch properties");
      return response.json();
    },
  });

  const handleSearch = (filters: typeof searchFilters) => {
    setSearchFilters(filters);
  };

  const toggleAmenity = (amenity: string) => {
    setSearchFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-red-600">
                Error loading properties. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Perfect <span className="text-yellow-300">PG Space</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Comfortable, affordable accommodation for students and working professionals
          </p>
          
          <SearchForm onSearch={handleSearch} />
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Filters:</span>
              <Button
                variant={searchFilters.amenities.includes("wifi") ? "default" : "outline"}
                size="sm"
                onClick={() => toggleAmenity("wifi")}
              >
                <Wifi className="h-4 w-4 mr-1" />
                WiFi
              </Button>
              <Button
                variant={searchFilters.amenities.includes("meals") ? "default" : "outline"}
                size="sm"
                onClick={() => toggleAmenity("meals")}
              >
                <Utensils className="h-4 w-4 mr-1" />
                Meals
              </Button>
              <Button
                variant={searchFilters.amenities.includes("parking") ? "default" : "outline"}
                size="sm"
                onClick={() => toggleAmenity("parking")}
              >
                <Car className="h-4 w-4 mr-1" />
                Parking
              </Button>
              <Button
                variant={searchFilters.amenities.includes("gym") ? "default" : "outline"}
                size="sm"
                onClick={() => toggleAmenity("gym")}
              >
                <Dumbbell className="h-4 w-4 mr-1" />
                Gym
              </Button>
              <Button variant="ghost" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                More Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Properties</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {properties?.length || 0} properties found
              </span>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Sort by: Relevance</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Distance</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <div className="flex space-x-2 mb-3">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : properties?.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No properties found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search filters or location
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties?.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {properties?.length > 0 && (
            <div className="text-center mt-8">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                Load More Properties
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
