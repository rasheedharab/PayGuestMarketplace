import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Menu, X, User, LogOut } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center text-2xl font-bold text-primary cursor-pointer">
              <Home className="mr-2" size={28} />
              PGHub
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/marketplace">
              <div className={`px-3 py-2 font-medium cursor-pointer ${
                location === "/marketplace" || location === "/"
                  ? "text-gray-900 border-b-2 border-primary"
                  : "text-gray-500 hover:text-primary"
              }`}>
                Find Properties
              </div>
            </Link>
            
            {isAuthenticated && user?.userType === "owner" && (
              <>
                <Link href="/dashboard">
                  <div className={`px-3 py-2 font-medium cursor-pointer ${
                    location === "/dashboard"
                      ? "text-gray-900 border-b-2 border-primary"
                      : "text-gray-500 hover:text-primary"
                  }`}>
                    Owner Dashboard
                  </div>
                </Link>
                <Link href="/list-property">
                  <div className={`px-3 py-2 font-medium cursor-pointer ${
                    location === "/list-property"
                      ? "text-gray-900 border-b-2 border-primary"
                      : "text-gray-500 hover:text-primary"
                  }`}>
                    List Your Property
                  </div>
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                      <User size={16} />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user?.firstName || "User"}
                  </span>
                  {user?.userType === "owner" && (
                    <Badge variant="secondary">Owner</Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90">
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="text-gray-500 hover:text-gray-700"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/marketplace">
              <div
                className={`block px-3 py-2 font-medium cursor-pointer ${
                  location === "/marketplace" || location === "/"
                    ? "text-gray-900 bg-gray-50"
                    : "text-gray-500 hover:text-primary"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Properties
              </div>
            </Link>
            
            {isAuthenticated && user?.userType === "owner" && (
              <>
                <Link href="/dashboard">
                  <div
                    className={`block px-3 py-2 font-medium cursor-pointer ${
                      location === "/dashboard"
                        ? "text-gray-900 bg-gray-50"
                        : "text-gray-500 hover:text-primary"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Owner Dashboard
                  </div>
                </Link>
                <Link href="/list-property">
                  <div
                    className={`block px-3 py-2 font-medium cursor-pointer ${
                      location === "/list-property"
                        ? "text-gray-900 bg-gray-50"
                        : "text-gray-500 hover:text-primary"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    List Your Property
                  </div>
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="border-t border-gray-200 pt-2">
                <div className="px-3 py-2 flex items-center space-x-2">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center">
                      <User size={12} />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user?.firstName || "User"}
                  </span>
                  {user?.userType === "owner" && (
                    <Badge variant="secondary" className="text-xs">Owner</Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="mx-3 mb-2 text-gray-600 hover:text-red-600"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleLogin}
                className="mx-3 mt-2 bg-primary hover:bg-primary/90"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
