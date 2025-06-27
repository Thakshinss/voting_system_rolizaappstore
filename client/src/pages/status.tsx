import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Users, Bell, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";

export default function Status() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/status"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const votedCandidates = data?.voted || [];
  const pendingCandidates = data?.pending || [];

  return (
    <div className="container mx-auto mt-8 p-4">
      {/* Header */}
      <Card className="mb-6 bg-info text-white border-0">
        <CardContent className="text-center py-6">
          <h2 className="text-3xl font-bold mb-2 flex items-center justify-center">
            <Users className="w-8 h-8 mr-3" />
            Voting Status
          </h2>
          <p className="text-lg">Track participation and remaining voters</p>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs defaultValue="voted" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="voted" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Completed Voters ({votedCandidates.length})</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Pending Voters ({pendingCandidates.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Voted Candidates Tab */}
        <TabsContent value="voted">
          <Card>
            <CardHeader className="bg-success text-white">
              <CardTitle className="flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Candidates Who Have Voted
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4">#</th>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Voter ID</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Voted At</th>
                      <th className="text-left p-4">Votes Given</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b animate-pulse">
                          <td className="p-4">
                            <div className="w-6 h-4 bg-muted rounded"></div>
                          </td>
                          <td className="p-4">
                            <div className="h-4 bg-muted rounded w-32"></div>
                          </td>
                          <td className="p-4">
                            <div className="h-4 bg-muted rounded w-20"></div>
                          </td>
                          <td className="p-4">
                            <div className="h-6 bg-muted rounded w-24"></div>
                          </td>
                          <td className="p-4">
                            <div className="h-4 bg-muted rounded w-28"></div>
                          </td>
                          <td className="p-4">
                            <div className="h-6 bg-muted rounded w-16"></div>
                          </td>
                        </tr>
                      ))
                    ) : votedCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No candidates have voted yet.
                        </td>
                      </tr>
                    ) : votedCandidates.map((candidate: any, index: number) => (
                      <tr key={candidate.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-semibold">{index + 1}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <User className="w-6 h-6 text-success" />
                            <span className="font-medium">{candidate.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <code className="bg-muted px-2 py-1 rounded text-sm">{candidate.voter_id}</code>
                        </td>
                        <td className="p-4">
                          <Badge className="bg-success text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">
                          {candidate.created_at ? formatDate(candidate.created_at) : "N/A"}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">3 votes</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Candidates Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader className="bg-warning text-black">
              <CardTitle className="flex items-center">
                <Clock className="w-6 h-6 mr-2" />
                Candidates Who Haven't Voted
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4">#</th>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Voter ID</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Registered</th>
                      <th className="text-left p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="border-b animate-pulse">
                          <td className="p-4">
                            <div className="w-6 h-4 bg-muted rounded"></div>
                          </td>
                          <td className="p-4">
                            <div className="h-4 bg-muted rounded w-32"></div>
                          </td>
                          <td className="p-4">
                            <div className="h-4 bg-muted rounded w-20"></div>
                          </td>
                          <td className="p-4">
                            <div className="h-6 bg-muted rounded w-24"></div>
                          </td>
                          <td className="p-4">
                            <div className="h-4 bg-muted rounded w-28"></div>
                          </td>
                          <td className="p-4">
                            <div className="h-8 bg-muted rounded w-20"></div>
                          </td>
                        </tr>
                      ))
                    ) : pendingCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          All candidates have voted! 🎉
                        </td>
                      </tr>
                    ) : pendingCandidates.map((candidate: any, index: number) => (
                      <tr key={candidate.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-semibold">{index + 1}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <User className="w-6 h-6 text-warning" />
                            <span className="font-medium">{candidate.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <code className="bg-muted px-2 py-1 rounded text-sm">{candidate.voter_id}</code>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className="bg-warning/20 text-warning-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">
                          {candidate.created_at ? formatDate(candidate.created_at) : "N/A"}
                        </td>
                        <td className="p-4">
                          <Button variant="outline" size="sm">
                            <Bell className="w-3 h-3 mr-1" />
                            Remind
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
