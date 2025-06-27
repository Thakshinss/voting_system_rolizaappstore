import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Award, BarChart3, Users, Clock, TrendingUp, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatPercentage } from "@/lib/utils";

export default function Results() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/results"],
    refetchInterval: 2000, // Refresh every 2 seconds for real-time updates
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache the data (TanStack Query v5)
  });

  const candidates = (data as any)?.candidates || [];
  const stats = (data as any)?.stats || {
    totalVotes: 0,
    votersParticipated: 0,
    remainingVoters: 0,
    participationRate: 0
  };



  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-4 h-4" />;
      case 1: return <Medal className="w-4 h-4" />;
      case 2: return <Award className="w-4 h-4" />;
      default: return <span className="text-sm font-bold">{index + 1}</span>;
    }
  };

  const getRankBadgeColor = (index: number) => {
    switch (index) {
      case 0: return "bg-yellow-500";
      case 1: return "bg-gray-400";
      case 2: return "bg-orange-500";
      default: return "bg-muted";
    }
  };

  const getProgressColor = (index: number) => {
    switch (index) {
      case 0: return "bg-green-500";
      case 1: return "bg-blue-500";
      case 2: return "bg-orange-500";
      default: return "bg-gray-400";
    }
  };

  return (
    <div className="container mx-auto mt-8 p-4">
      {/* Header */}
      <Card className="mb-6 bg-success text-white border-0">
        <CardContent className="text-center py-6">
          <h2 className="text-3xl font-bold mb-2 flex items-center justify-center">
            <Trophy className="w-8 h-8 mr-3" />
            Voting Results
          </h2>
          <p className="text-lg">Live leaderboard of candidates by votes received</p>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-primary">
          <CardContent className="text-center py-4">
            <div className="text-3xl font-bold text-primary mb-2">{stats.totalVotes}</div>
            <h6 className="font-semibold text-muted-foreground">Total Votes</h6>
          </CardContent>
        </Card>
        
        <Card className="border-success">
          <CardContent className="text-center py-4">
            <div className="text-3xl font-bold text-success mb-2">{stats.votersParticipated}</div>
            <h6 className="font-semibold text-muted-foreground">Voters Participated</h6>
          </CardContent>
        </Card>
        
        <Card className="border-warning">
          <CardContent className="text-center py-4">
            <div className="text-3xl font-bold text-warning mb-2">{stats.remainingVoters}</div>
            <h6 className="font-semibold text-muted-foreground">Pending Voters</h6>
          </CardContent>
        </Card>
        
        <Card className="border-info">
          <CardContent className="text-center py-4">
            <div className="text-3xl font-bold text-info mb-2">{stats.participationRate}%</div>
            <h6 className="font-semibold text-muted-foreground">Participation Rate</h6>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center text-xl">
            <BarChart3 className="w-6 h-6 mr-2" />
            Candidate Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4">Rank</th>
                  <th className="text-left p-4">Candidate</th>
                  <th className="text-left p-4">Voter ID</th>
                  <th className="text-left p-4">Votes Received</th>
                  <th className="text-left p-4">Percentage</th>
                  <th className="text-left p-4">Visual</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b animate-pulse">
                      <td className="p-4">
                        <div className="w-8 h-8 bg-muted rounded"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-muted rounded w-32"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-muted rounded w-20"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-6 bg-muted rounded w-12"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-muted rounded w-16"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-5 bg-muted rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : candidates.map((candidate: any, index: number) => (
                  <tr 
                    key={candidate.id} 
                    className={`border-b hover:bg-muted/50 transition-colors ${
                      index < 3 ? 'bg-muted/20' : ''
                    }`}
                  >
                    <td className="p-4">
                      <Badge className={`${getRankBadgeColor(index)} text-white flex items-center justify-center w-8 h-8`}>
                        {getRankIcon(index)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <User className={`w-8 h-8 ${
                          index === 0 ? 'text-primary' : 
                          index === 1 ? 'text-success' : 
                          index === 2 ? 'text-warning' : 'text-muted-foreground'
                        }`} />
                        <span className="font-semibold">{candidate.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="bg-muted px-2 py-1 rounded text-sm">{candidate.voter_id}</code>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center">
                        <div className="bg-green-600 text-white text-xl px-4 py-2 rounded-lg font-bold min-w-[3rem] text-center shadow-lg">
                          {candidate.votes_received !== undefined ? candidate.votes_received : 0}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold">
                      {formatPercentage(candidate.percentage)}
                    </td>
                    <td className="p-4">
                      <div className="w-full bg-muted rounded-full h-5 overflow-hidden">
                        <div 
                          className={`h-full ${getProgressColor(index)} transition-all duration-500`}
                          style={{ width: `${candidate.percentage}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
