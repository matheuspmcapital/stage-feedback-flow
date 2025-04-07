import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Code, Project } from "./AdminDashboard";
import CodeGenerator from "./CodeGenerator";
import CodeResponseDetails from "./CodeResponseDetails";
import { Search, SlidersHorizontal, ArrowUpDown, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Eye, ClipboardCopy, Link } from "lucide-react";

interface GeneratedCodesProps {
  codes: Code[];
  projects: Project[];
  onCodeGenerated: (code: Code) => void;
  formatDate: (date: string | undefined) => string;
}

const GeneratedCodes: React.FC<GeneratedCodesProps> = ({
  codes,
  projects,
  onCodeGenerated,
  formatDate
}) => {
  const [selectedCode, setSelectedCode] = useState<Code | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterServiceType, setFilterServiceType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("generated_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  

  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate time spent for each code
  const calculateTimeSpent = (code: Code): string => {
    if (!code.started_at || !code.completed_at) return "--";
    
    const startTime = new Date(code.started_at).getTime();
    const endTime = new Date(code.completed_at).getTime();
    const diffInSeconds = Math.floor((endTime - startTime) / 1000);
    
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    
    return `${minutes}m ${seconds}s`;
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: `Code "${code}" copied successfully.`
      });
    });
  };
  
  const handleCopyUrl = (code: Code) => {
    // Get the base URL
    const baseUrl = window.location.origin;
    // Create the full URL with parameters
    const language = code.language || "pt"; // Default to pt if not set
    const fullUrl = `${baseUrl}/?lang=${language}&code=${code.code}`;
    
    navigator.clipboard.writeText(fullUrl).then(() => {
      toast({
        title: "URL Copied to Clipboard",
        description: `Survey URL copied successfully.`
      });
    });
  };

  const { toast } = useToast();
  // Filter and sort codes
  const filteredCodes = codes.filter(code => {
    const matchesSearch = 
      code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (code.project_name && code.project_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (code.company_name && code.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesServiceType = !filterServiceType || code.service_type === filterServiceType;
    
    let matchesStatus = true;
    if (filterStatus === "completed") {
      matchesStatus = !!code.completed_at;
    } else if (filterStatus === "in_progress") {
      matchesStatus = !!code.started_at && !code.completed_at;
    } else if (filterStatus === "pending") {
      matchesStatus = !code.started_at;
    }
    
    return matchesSearch && matchesServiceType && matchesStatus;
  });

  // Sort codes
  const sortedCodes = [...filteredCodes].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortField) {
      case "name":
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case "email":
        valueA = a.email.toLowerCase();
        valueB = b.email.toLowerCase();
        break;
      case "project":
        valueA = (a.project_name || "").toLowerCase();
        valueB = (b.project_name || "").toLowerCase();
        break;
      case "company":
        valueA = (a.company_name || "").toLowerCase();
        valueB = (b.company_name || "").toLowerCase();
        break;
      case "service_type":
        valueA = a.service_type.toLowerCase();
        valueB = b.service_type.toLowerCase();
        break;
      case "status":
        valueA = a.completed_at ? 3 : a.started_at ? 2 : 1;
        valueB = b.completed_at ? 3 : b.started_at ? 2 : 1;
        break;
      default: // generated_at
        valueA = new Date(a.generated_at).getTime();
        valueB = new Date(b.generated_at).getTime();
    }
    
    const comparison = typeof valueA === 'string' 
      ? valueA.localeCompare(valueB as string)
      : (valueA as number) - (valueB as number);
      
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedCodes.length / pageSize);
  const paginatedCodes = sortedCodes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search codes, names, emails..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filterServiceType || "all"}
                onValueChange={(value) => setFilterServiceType(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Service Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="strategy">Strategy</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterStatus || "all"}
                onValueChange={(value) => setFilterStatus(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
              
              <Button onClick={() => setIsGeneratorOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Code
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("code")}>
                    Code {sortField === "code" && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                    Name {sortField === "name" && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                  </TableHead>
                  <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => toggleSort("project")}>
                    Project {sortField === "project" && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                  </TableHead>
                  <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => toggleSort("service_type")}>
                    Type {sortField === "service_type" && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("status")}>
                    Status {sortField === "status" && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                  </TableHead>
                  <TableHead className="cursor-pointer hidden lg:table-cell" onClick={() => toggleSort("generated_at")}>
                    Generated {sortField === "generated_at" && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Time Spent</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono">
                      {code.code}

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleCopyCode(code.code)} 
                        className="h-4 w-4 ml-2"
                      >
                        <ClipboardCopy className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div>
                        {code.name}
                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                          {code.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {code.project_name}
                      {code.company_name && (
                        <div className="text-xs text-muted-foreground">
                          {code.company_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={code.service_type === "experience" ? "default" : "outline"}>
                        {code.service_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {code.completed_at ? (
                        <Badge className="bg-green-500">Completed</Badge>
                      ) : code.started_at ? (
                        <Badge className="bg-orange-400">Started</Badge>
                      ) : (
                        <Badge className="bg-red-400">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {formatDate(code.generated_at)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {calculateTimeSpent(code)}
                    </TableCell>
                    <TableCell>
                      <div className="flex">
                        <Button 
                          onClick={() => setSelectedCode(code)} 
                          variant="ghost" 
                          className="flex h-8 p-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleCopyUrl(code)} 
                          variant="ghost" 
                          className="flex h-8 p-2"
                          title="Copy survey URL"
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {paginatedCodes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No codes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedCodes.length)} of {sortedCodes.length} codes
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedCode}
        onOpenChange={(open) => !open && setSelectedCode(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh]" style={{overflow:"scroll"}}>
          <DialogHeader>
            <DialogTitle>Code Details: {selectedCode?.code}</DialogTitle>
            <DialogDescription>
              Generated on {formatDate(selectedCode?.generated_at)}
            </DialogDescription>
          </DialogHeader>
          {selectedCode && <CodeResponseDetails code={selectedCode} />}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate New NPS Code</DialogTitle>
          </DialogHeader>
          <CodeGenerator 
            projects={projects} 
            onCodeGenerated={(code) => {
              onCodeGenerated(code);
              setIsGeneratorOpen(false);
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GeneratedCodes;
