import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Wifi, Utensils, Car, Shield, Users, Dumbbell } from "lucide-react";
import type { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const amenityIcons = {
    wifi: Wifi,
    meals: Utensils,
    parking: Car,
    security: Shield,
    community: Users,
    gym: Dumbbell,
  };

  // Fallback image
  const fallbackImage = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop";
  const imageUrl = property.images?.[0] || fallbackImage;

  // Sample amenities if not provided
  const amenities = property.amenities || ['wifi', 'meals', 'parking'];

  // Status badge logic
  const getStatusBadge = () => {
    if (property.isActive) {
      return <Badge className="bg-secondary text-white">Available</Badge>;
    }
    return <Badge variant="outline">Unavailable</Badge>;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <img
          src={imageUrl}
          alt={property.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          {getStatusBadge()}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {property.name}
          </h3>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="line-clamp-1">{property.city}, {property.state}</span>
        </div>
        
        <div className="flex items-center space-x-2 mb-3 flex-wrap gap-1">
          {amenities.slice(0, 3).map((amenity) => {
            const Icon = amenityIcons[amenity as keyof typeof amenityIcons] || Shield;
            return (
              <Badge key={amenity} variant="outline" className="text-xs">
                <Icon className="h-3 w-3 mr-1" />
                {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
              </Badge>
            );
          })}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xl font-bold text-gray-900">
              ₹8,000
            </span>
            <span className="text-sm text-gray-500">/month</span>
          </div>
          <Link href={`/property/${property.id}`}>
            <Button className="bg-primary hover:bg-primary/90">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
