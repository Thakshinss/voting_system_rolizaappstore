import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/navbar";
import Login from "@/pages/login";
import Voting from "@/pages/voting";
import Results from "@/pages/results";
import Status from "@/pages/status";
import Admin from "@/pages/admin";
import Thanks from "@/pages/thank";
import NotFound from "@/pages/not-found";
import { useLocation } from "wouter";


function Router() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };
  const [location] = useLocation();
  const shouldShowNavbar = location !== "/voting";
  

  return (
    <div className="min-h-screen bg-background">
      {shouldShowNavbar && (
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
      )}
      {/* <Navbar currentUser={currentUser} onLogout={handleLogout} /> */}
      
      <Switch>
        <Route path="/">
          {currentUser ? (
            <Voting currentUser={currentUser} />
          ) : (
            <Login onLogin={handleLogin} />
          )}
        </Route>
        
        <Route path="/login">
          <Login onLogin={handleLogin} />
        </Route>
        
        <Route path="/voting">
          {currentUser ? (
            <Voting currentUser={currentUser} />
          ) : (
            <Login onLogin={handleLogin} />
          )}
        </Route>
        
        <Route path="/results">
          <Results />
        </Route>
        <Route path="/thanks">
          <Thanks />
        </Route>
        
        <Route path="/status">
          <Status />
        </Route>
        
        <Route path="/admin">
          <Admin />
        </Route>
        
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
