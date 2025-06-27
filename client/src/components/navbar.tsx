import { Link, useLocation } from "wouter";
import { Vote, BarChart3, Users, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  currentUser: any;
  onLogout: () => void;
}

export default function Navbar({ currentUser, onLogout }: NavbarProps) {
  const [location] = useLocation();

  if (!currentUser) {
    return (
      <nav className="bg-primary text-white px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
            <Vote className="w-6 h-6" />
            <span>Online Voting System</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-primary text-white px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
          <Vote className="w-6 h-6" />
          <span>Online Voting System</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link href="/voting">
            <Button 
              variant={location === "/voting" ? "secondary" : "ghost"}
              size="sm"
              className="text-white hover:text-primary"
            >
              <Vote className="w-4 h-4 mr-2" />
              Vote
            </Button>
          </Link>
          
          <Link href="/results">
            <Button 
              variant={location === "/results" ? "secondary" : "ghost"}
              size="sm"
              className="text-white hover:text-primary"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Results
            </Button>
          </Link>
          
          <Link href="/status">
            <Button 
              variant={location === "/status" ? "secondary" : "ghost"}
              size="sm"
              className="text-white hover:text-primary"
            >
              <Users className="w-4 h-4 mr-2" />
              Status
            </Button>
          </Link>
          
          <Link href="/admin">
            <Button 
              variant={location === "/admin" ? "secondary" : "ghost"}
              size="sm"
              className="text-white hover:text-primary"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onLogout}
            className="text-warning hover:text-warning/80"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
