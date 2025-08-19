import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, User, Settings, LogOut, Bell } from "lucide-react";

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: "Patient" | "Doctor" | "Admin" | "SuperAdmin";
    avatar?: string;
    isVerified?: boolean;
  };
  onLogout?: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications] = useState(3); // Mock notification count

  const handleLogout = () => {
    onLogout?.();
    navigate("/login");
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Doctor":
        return "default";
      case "Admin":
        return "secondary";
      case "SuperAdmin":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">CareCircle</span>
          </Link>
          
          {user && (
            <div className="hidden md:flex items-center space-x-6 ml-8">
              <Link 
                to="/dashboard" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/communities" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/communities" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Communities
              </Link>
              {(user.role === "Doctor" || user.role === "Admin" || user.role === "SuperAdmin") && (
                <Link 
                  to="/validation" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === "/validation" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Validation
                </Link>
              )}
              {(user.role === "Admin" || user.role === "SuperAdmin") && (
                <Link 
                  to="/admin" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        {user.isVerified && user.role === "Doctor" && (
                          <Badge variant="default" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button onClick={() => navigate("/register")}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}