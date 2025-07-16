import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Building, 
  Bed, 
  Calendar, 
  Users, 
  IndianRupee, 
  TrendingUp, 
  Settings 
} from "lucide-react";

export default function DashboardSidebar() {
  const [location] = useLocation();

  const menuItems = [
    { icon: BarChart3, label: "Dashboard", path: "/dashboard" },
    { icon: Building, label: "Properties", path: "/dashboard/properties" },
    { icon: Bed, label: "Rooms & Beds", path: "/dashboard/rooms" },
    { icon: Calendar, label: "Bookings", path: "/dashboard/bookings" },
    { icon: Users, label: "Tenants", path: "/dashboard/tenants" },
    { icon: IndianRupee, label: "Payments", path: "/dashboard/payments" },
    { icon: TrendingUp, label: "Analytics", path: "/dashboard/analytics" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0">
      <div className="flex items-center justify-center h-16 bg-primary text-white">
        <h2 className="text-xl font-bold">Owner Dashboard</h2>
      </div>
      
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer ${
                    isActive ? "bg-gray-100" : ""
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
