
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Code } from "./AdminDashboard";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import CodeGenerator from "./CodeGenerator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CodeResponseDetails from "./CodeResponseDetails";

interface GeneratedCodesProps {
  codes: Code[];
  onCodeGenerated: (code: Code) => void;
  projects: any[];
}

const GeneratedCodes: React.FC<GeneratedCodesProps> = ({ 
  codes, 
  onCodeGenerated,
  projects
}) => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCode, setSelectedCode] = useState<Code | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const itemsPerPage = 10;
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };
  
  const handleViewCode = (code: Code) => {
    setSelectedCode(code);
    setDetailsOpen(true);
  };

  // Calculate pagination
  const totalPages = Math.ceil(codes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCodes = codes.slice(startIndex, startIndex + itemsPerPage);

  // Calculate time spent for each code
  const getTimeSpent = (code: Code) => {
    if (code.started_at && code.completed_at) {
      const start = new Date(code.started_at).getTime();
      const end = new Date(code.completed_at).getTime();
      const diffInMinutes = Math.round((end - start) / (1000 * 60));
      
      if (diffInMinutes < 1) {
        return "< 1 minute";
      } else if (diffInMinutes === 1) {
        return "1 minute";
      } else {
        return `${diffInMinutes} minutes`;
      }
    }
    return "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">Generated Codes</h2>
        <CodeGenerator 
          onCodeGenerated={onCodeGenerated} 
          projects={projects}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Time Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono font-bold">{code.code}</TableCell>
                    <TableCell>{code.name}</TableCell>
                    <TableCell>{code.company_name || '-'}</TableCell>
                    <TableCell>{code.project_name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={code.service_type === "experience" ? "default" : "outline"}>
                        {code.service_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(code.generated_at)}</TableCell>
                    <TableCell>{getTimeSpent(code)}</TableCell>
                    <TableCell>
                      {code.completed_at ? (
                        <Badge className="bg-green-500">Completed</Badge>
                      ) : code.started_at ? (
                        <Badge className="bg-orange-400">Started</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewCode(code)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {displayedCodes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No codes generated yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      {/* Response Details Dialog */}
      {selectedCode && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-[720px]">
            <DialogHeader>
              <DialogTitle>Response Details for Code: {selectedCode.code}</DialogTitle>
            </DialogHeader>
            <CodeResponseDetails code={selectedCode} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default GeneratedCodes;
