import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Vote, IdCard, AlertTriangle, Info } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logo  from "../logo.jpeg"

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [, navigate] = useLocation();
  const [voterId, setVoterId] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (voter_id: string) => {
      const response = await apiRequest("POST", "/api/login", { voter_id });
      return response.json();
    },
    onSuccess: (data) => {
      onLogin(data.candidate);
      toast({
        title: "Login successful!",
        description: "Welcome to the voting portal.",
      });
      navigate("/voting");
    },
    onError: (error: any) => {
      setError(error.message || "Invalid voter ID. Please check your credentials.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!voterId.trim()) {
      setError("Please enter your voter ID");
      return;
    }
    
    loginMutation.mutate(voterId.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center text-white mb-8">
          <div className="flex items-center justify-center mb-4">
          <img
              src={logo}
              alt="Voting"
              className="w-80 h-40 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold mb-3">நமது ஊர் நமது வளர்ச்சி வில்லுக்குறி.</h1>
          <p className="text-blue-100 text-lg">செயற்குழு தேர்தல் 2025</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-primary text-white text-center rounded-t-lg">
            <CardTitle className="flex items-center justify-center text-xl">
              <IdCard className="w-5 h-5 mr-2" />
              Voter Login
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voterId">Voter ID</Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="voterId"
                    type="text"
                    placeholder="Enter your unique voter ID"
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Use your assigned voter ID to access the voting portal
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-700" 
                disabled={loginMutation.isPending}
              >
                <IdCard className="w-4 h-4 mr-2" />
                {loginMutation.isPending ? "Logging in..." : "Login to Vote"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <Card className="mt-4 border-info">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center text-info mb-2">
              <Info className="w-4 h-4 mr-2" />
              <h6 className="font-semibold">Voter_id Format</h6>
            </div>
            <p className="text-sm text-muted-foreground">
            உங்கள் வாக்காளர் ID என்பது நாட்டின் குறியீடு கூடிய உங்கள் மொபைல் எண்ணாகும். (eg.+919384260514) ,அல்லது உங்கள் இரண்டாவது பெயர் 
            </p>
            <p className="text-sm text-muted-foreground">
              Your voter id is your mobile number with country code (eg.+919384260514) or Your second name
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
