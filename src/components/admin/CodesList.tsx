
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

interface Code {
  code: string;
  name: string;
  email: string;
  company: string;
  serviceType: string;
  generatedAt: string;
  submittedAt?: string;
}

interface CodesListProps {
  codes: Code[];
}

const CodesList: React.FC<CodesListProps> = ({ codes }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
                <TableHead>Service Type</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((code) => (
                <TableRow key={code.code}>
                  <TableCell className="font-mono">{code.code}</TableCell>
                  <TableCell>{code.name}</TableCell>
                  <TableCell>{code.company}</TableCell>
                  <TableCell>
                    <Badge variant={code.serviceType === "experience" ? "default" : "outline"}>
                      {code.serviceType}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(code.generatedAt)}</TableCell>
                  <TableCell>
                    {code.submittedAt ? (
                      <Badge variant="secondary">Completed</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {codes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
