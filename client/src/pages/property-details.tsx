import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Wifi, 
  Utensils, 
  Car, 
  Shield, 
  Users, 
  Star,
  Phone,
  Mail,
  Heart,
  Share2
} from "lucide-react";

export default function PropertyDetails() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ["/api/properties", id],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${id}`);
      if (!response.ok) throw new Error("Property not found");
      return response.json();
    },
    enabled: !!id,
  });

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ["/api/properties", id, "rooms"],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${id}/rooms`);
      if (!response.ok) throw new Error("Failed to fetch rooms");
      return response.json();
    },
    enabled: !!id,
  });

  const amenityIcons = {
    wifi: Wifi,
    meals: Utensils,
    parking: Car,
    security: Shield,
    community: Users,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full mb-4" />
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
              <Skeleton className="h-8 w-1/2 mb-4" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-1/2 mb-4" />
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-red-600">
                Property not found or error loading property details.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Fallback images for demonstration
  const fallbackImages = [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
  ];

  const images = property.images?.length > 0 ? property.images : fallbackImages;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-6">
              <div className="relative mb-4">
                <img
                  src={images[selectedImage]}
                  alt={property.name}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button variant="outline" size="sm" className="bg-white/90">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white/90">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`h-16 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${property.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Property Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {property.name}
                  </h1>
                  <Badge variant="secondary">
                    {property.propertyType?.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.address}, {property.city}, {property.state}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>4.5 (24 reviews)</span>
                  </div>
                  <Badge variant="outline">
                    {property.gender === 'mixed' ? 'Co-ed' : 
                     property.gender === 'male' ? 'Male Only' : 'Female Only'}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {property.description || 
                   "This is a comfortable and well-maintained accommodation perfect for students and working professionals. The property offers modern amenities and a safe environment with 24/7 security."}
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(property.amenities || ['wifi', 'meals', 'parking', 'security']).map((amenity) => {
                    const Icon = amenityIcons[amenity as keyof typeof amenityIcons] || Shield;
                    return (
                      <div key={amenity} className="flex items-center space-x-2 p-3 bg-white rounded-lg border">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium capitalize">
                          {amenity.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rooms */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Available Rooms</h2>
                {roomsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <Skeleton className="h-5 w-32 mb-2" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="text-right">
                              <Skeleton className="h-6 w-20 mb-1" />
                              <Skeleton className="h-8 w-24" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : rooms?.length === 0 ? (
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-center text-gray-500">
                        No rooms available at the moment
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {rooms?.map((room) => (
                      <Card key={room.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-gray-900">{room.name}</h3>
                              <p className="text-sm text-gray-600 capitalize">
                                {room.roomType} • {room.capacity} beds
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">
                                ₹{room.pricePerBed}/month
                              </div>
                              <Button size="sm" className="mt-1">
                                Book Now
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Rules */}
              {property.rules && property.rules.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">House Rules</h2>
                  <Card>
                    <CardContent className="p-4">
                      <ul className="space-y-2">
                        {property.rules.map((rule, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-gray-400 mt-1">•</span>
                            <span className="text-gray-700">{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      Starting from ₹{rooms?.[0]?.pricePerBed || '8,000'}
                    </div>
                    <div className="text-sm text-gray-600">per month</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Security Deposit</span>
                      <span>₹{rooms?.[0]?.deposit || '10,000'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Monthly Rent</span>
                      <span>₹{rooms?.[0]?.pricePerBed || '8,000'}</span>
                    </div>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Book Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    Schedule Visit
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center">
                      <span className="text-sm font-medium">O</span>
                    </div>
                    <div>
                      <p className="font-medium">Property Owner</p>
                      <p className="text-sm text-gray-600">Verified</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Owner
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Property Type</span>
                    <span className="font-medium capitalize">
                      {property.propertyType?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Gender</span>
                    <span className="font-medium capitalize">
                      {property.gender === 'mixed' ? 'Co-ed' : property.gender}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Rooms</span>
                    <span className="font-medium">{rooms?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pincode</span>
                    <span className="font-medium">{property.pincode}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
