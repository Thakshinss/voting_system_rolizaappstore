import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Vote, Search, CheckCircle, Info, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface VotingProps {
  currentUser: any;
}

export default function Voting({ currentUser }: VotingProps) {
  const [, navigate] = useLocation();
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const maxSelections = 3;

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["/api/candidates"],
  });

  const submitVotesMutation = useMutation({
    mutationFn: async (data: { voter_id: string; selected_candidates: number[] }) => {
      const response = await apiRequest("POST", "/api/votes", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Votes submitted successfully!",
        description: "Thank you for participating in the voting process.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      navigate("/results");
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting votes",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredCandidates = candidates.filter((candidate: any) => 
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    candidate.id !== currentUser?.id
  );

  const handleCandidateSelect = (candidateId: number, checked: boolean) => {
    if (checked) {
      if (selectedCandidates.length >= maxSelections) {
        toast({
          title: "Selection limit reached",
          description: `You can only select ${maxSelections} candidates.`,
          variant: "destructive",
        });
        return;
      }
      setSelectedCandidates([...selectedCandidates, candidateId]);
    } else {
      setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCandidates.length !== maxSelections) {
      toast({
        title: "Invalid selection",
        description: `Please select exactly ${maxSelections} candidates.`,
        variant: "destructive",
      });
      return;
    }
    
    submitVotesMutation.mutate({
      voter_id: currentUser.voter_id,
      selected_candidates: selectedCandidates
    });
  };

  if (currentUser?.has_voted) {
    return (
      <div className="container mx-auto mt-8 p-4">
        <Alert className="max-w-2xl mx-auto">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-center">
            <h4 className="font-semibold text-lg mb-2">You Have Already Voted!</h4>
            <p>Thank you for participating. You can view the results and status pages.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 p-4">
      {/* Header */}
      <Card className="mb-6 bg-primary text-white border-0">
        <CardContent className="text-center py-6">
          <h2 className="text-3xl font-bold mb-2 flex items-center justify-center">
            <Vote className="w-8 h-8 mr-3" />
            Cast Your Vote
          </h2>
          <p className="text-lg">Select exactly 3 candidates you want to vote for</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Instructions */}
        <div className="lg:col-span-2">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Instructions:</strong> You must select exactly 3 different candidates. 
              You cannot vote for yourself or vote multiple times.
            </AlertDescription>
          </Alert>
        </div>

        {/* Search */}
        <div className="bg-white rounded-full border shadow-sm p-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Selection Counter */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Available Candidates</h3>
        <Badge variant="secondary" className="text-base px-4 py-2">
          Selected: {selectedCandidates.length}/{maxSelections}
        </Badge>
      </div>

      {/* Candidates Grid */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-20 mx-auto"></div>
                </CardContent>
              </Card>
            ))
          ) : filteredCandidates.map((candidate: any) => {
            const isSelected = selectedCandidates.includes(candidate.id);
            const isDisabled = !isSelected && selectedCandidates.length >= maxSelections;

            return (
              <Card 
                key={candidate.id} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isSelected ? 'border-success bg-success/5' : ''
                } ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => !isDisabled && handleCandidateSelect(candidate.id, !isSelected)}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <User className="w-12 h-12 mx-auto text-primary" />
                  </div>
                  <h6 className="font-semibold mb-2">{candidate.name}</h6>
                  <p className="text-sm text-muted-foreground mb-4">{candidate.voter_id}</p>
                  <div className="flex items-center justify-center space-x-2">
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      onCheckedChange={(checked) => handleCandidateSelect(candidate.id, checked)}
                    />
                    <span className="text-sm">Select</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <Button 
            type="submit" 
            size="lg"
            disabled={selectedCandidates.length !== maxSelections || submitVotesMutation.isPending}
            className="bg-success hover:bg-success/90"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {submitVotesMutation.isPending ? "Submitting..." : "Submit My Votes"}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            You must select exactly {maxSelections} candidates to proceed
          </p>
        </div>
      </form>
    </div>
  );
}
