import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, UserPlus, Download, RotateCcw, BarChart3, Edit, Trash2, User, CheckCircle, Clock, Upload, FileSpreadsheet } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDate } from "@/lib/utils";
import * as XLSX from 'xlsx';

const addCandidateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  voter_id: z.string().min(1, "Voter ID is required"),
});

type AddCandidateForm = z.infer<typeof addCandidateSchema>;

export default function Admin() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedCandidates, setUploadedCandidates] = useState<AddCandidateForm[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["/api/candidates"],
  });

  const candidateList = candidates as any[];

  const form = useForm<AddCandidateForm>({
    resolver: zodResolver(addCandidateSchema),
    defaultValues: {
      name: "",
      voter_id: "",
    },
  });

  const addCandidateMutation = useMutation({
    mutationFn: async (data: AddCandidateForm) => {
      const response = await apiRequest("POST", "/api/candidates", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Candidate added successfully!",
        description: "The new candidate can now log in and vote.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      setIsAddModalOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error adding candidate",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkUploadMutation = useMutation({
    mutationFn: async (candidates: AddCandidateForm[]) => {
      const responses = await Promise.allSettled(
        candidates.map(candidate => 
          apiRequest("POST", "/api/candidates", candidate).then(res => res.json())
        )
      );
      
      const successful = responses.filter(result => result.status === 'fulfilled').length;
      const failed = responses.filter(result => result.status === 'rejected').length;
      
      return { successful, failed, total: candidates.length };
    },
    onSuccess: (result) => {
      toast({
        title: "Bulk upload completed!",
        description: `${result.successful} candidates added successfully. ${result.failed > 0 ? `${result.failed} failed.` : ''}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      setIsUploadModalOpen(false);
      setUploadedCandidates([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error during bulk upload",
        description: error.message || "An error occurred during bulk upload.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row and process data
        const candidates: AddCandidateForm[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length >= 2 && row[0] && row[1]) {
            candidates.push({
              name: String(row[0]).trim(),
              voter_id: String(row[1]).trim(),
            });
          }
        }

        if (candidates.length === 0) {
          toast({
            title: "No valid data found",
            description: "Please ensure your Excel file has 'Name' in column A and 'Voter ID' in column B.",
            variant: "destructive",
          });
        } else {
          setUploadedCandidates(candidates);
          setIsUploadModalOpen(true);
          toast({
            title: "File processed successfully!",
            description: `Found ${candidates.length} candidates ready to upload.`,
          });
        }
      } catch (error) {
        toast({
          title: "Error processing file",
          description: "Please ensure you uploaded a valid Excel file (.xlsx, .xls).",
          variant: "destructive",
        });
      } finally {
        setIsProcessingFile(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const onSubmit = (data: AddCandidateForm) => {
    addCandidateMutation.mutate(data);
  };

  return (
    <div className="container mx-auto mt-8 p-4">
      {/* Header */}
      
      <Card className="mb-6 bg-slate-900 text-white border-0">
        <CardContent className="text-center py-6">
          <h2 className="text-3xl font-bold mb-2 flex items-center justify-center">
            <Settings className="w-8 h-8 mr-3" />
            Admin Dashboard
          </h2>
          <p className="text-lg">Manage candidates and voting system settings</p>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <CardContent className="py-6">
            <UserPlus className="w-12 h-12 text-primary mx-auto mb-3" />
            <h6 className="font-semibold mb-3">Add Candidate</h6>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-slate-600">Add New</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add New Candidate
                  </DialogTitle>
                  <DialogDescription>
                    Add a new candidate to the voting system. They will be able to log in using their voter ID.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Candidate Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voter_id">Voter ID</Label>
                    <Input
                      id="voter_id"
                      placeholder="e.g., VOTER007"
                      {...form.register("voter_id")}
                    />
                    <p className="text-sm text-muted-foreground">Must be unique across all candidates</p>
                    {form.formState.errors.voter_id && (
                      <p className="text-sm text-destructive">{form.formState.errors.voter_id.message}</p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" className="bg-blue-700" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-800" disabled={addCandidateMutation.isPending}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {addCandidateMutation.isPending ? "Adding..." : "Add Candidate"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="py-6">
            <FileSpreadsheet className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h6 className="font-semibold mb-3">Bulk Upload</h6>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                size="sm" 
                variant="outline" 
                className="text-blue-600 border-blue-600 w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingFile}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isProcessingFile ? "Processing..." : "Upload Excel"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="py-6">
            <Download className="w-12 h-12 text-success mx-auto mb-3" />
            <h6 className="font-semibold mb-3">Export Results</h6>
            <Button variant="outline" size="sm" className="text-success border-success">
              Download CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="py-6">
            <RotateCcw className="w-12 h-12 text-warning mx-auto mb-3" />
            <h6 className="font-semibold mb-3">Reset Voting</h6>
            <Button variant="outline" size="sm" className="text-warning border-warning">
              Reset System
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="py-6">
            <BarChart3 className="w-12 h-12 text-info mx-auto mb-3" />
            <h6 className="font-semibold mb-3">Analytics</h6>
            <Button variant="outline" size="sm" className="text-info border-info">
              View Stats
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Management */}
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center text-xl">
            <Settings className="w-6 h-6 mr-2" />
            Candidate Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Voter ID</th>
                  <th className="text-left p-4">Voting Status</th>
                  <th className="text-left p-4">Votes Received</th>
                  <th className="text-left p-4">Created</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b animate-pulse">
                      <td className="p-4">
                        <div className="w-8 h-4 bg-muted rounded"></div>
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
                        <div className="h-6 bg-muted rounded w-12"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-muted rounded w-24"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-8 bg-muted rounded w-16"></div>
                      </td>
                    </tr>
                  ))
                ) : candidateList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No candidates found. Add some candidates to get started.
                    </td>
                  </tr>
                ) : candidateList.map((candidate: any) => (
                  <tr key={candidate.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-semibold">{candidate.id}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-6 h-6 text-primary" />
                        <span className="font-medium">{candidate.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="bg-muted px-2 py-1 rounded text-sm">{candidate.voter_id}</code>
                    </td>
                    <td className="p-4">
                      {candidate.has_voted ? (
                        <Badge className="bg-success text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Voted
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-warning/20 text-warning-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {candidate.votes_received}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">
                      {formatDate(candidate.created_at)}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive border-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Upload Confirmation Dialog */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileSpreadsheet className="w-5 h-5 mr-2" />
              Confirm Bulk Upload
            </DialogTitle>
            <DialogDescription>
              Review the candidates found in your Excel file before uploading.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-96 overflow-y-auto">
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Found {uploadedCandidates.length} candidates</strong> in your Excel file.
                Please review the data below and confirm to proceed.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4 p-2 bg-muted rounded text-sm font-semibold">
                <div>Name</div>
                <div>Voter ID</div>
              </div>
              {uploadedCandidates.map((candidate, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 p-2 border-b">
                  <div>{candidate.name}</div>
                  <div><code className="bg-muted px-2 py-1 rounded text-xs">{candidate.voter_id}</code></div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsUploadModalOpen(false);
                setUploadedCandidates([]);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={() => bulkUploadMutation.mutate(uploadedCandidates)}
              disabled={bulkUploadMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {bulkUploadMutation.isPending ? "Uploading..." : `Upload ${uploadedCandidates.length} Candidates`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
