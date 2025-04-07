
import React from "react";
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
import { Code } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CodesListProps {
  codes: Code[];
  formatDate: (dateString: string | undefined) => string;
}

const CodesList: React.FC<CodesListProps> = ({ codes, formatDate }) => {
  const { toast } = useToast();
  
  const handleViewCode = (code: Code) => {
    // In a full implementation, this would navigate to a details page
    toast({
      title: "View Code Details",
      description: `Viewing details for code: ${code.code}`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Codes</CardTitle>
      </CardHeader>
      <CardContent>
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
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono">{code.code}</TableCell>
                  <TableCell>{code.name}</TableCell>
                  <TableCell>{code.company_name || '-'}</TableCell>
                  <TableCell>{code.project_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={code.service_type === "experience" ? "default" : "outline"}>
                      {code.service_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(code.generated_at)}</TableCell>
                  <TableCell>
                    {code.completed_at ? (
                      <Badge variant="secondary">Completed</Badge>
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
              {codes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No codes generated yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodesList;
