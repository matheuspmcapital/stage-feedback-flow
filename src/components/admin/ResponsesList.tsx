
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Response {
  userName: string;
  code: string;
  recommendScore: number;
  recommendReason: string;
  rehireScore: number;
  testimonial: string;
  canPublish: boolean;
  submittedAt: string;
}

interface ResponsesListProps {
  responses: Response[];
}

const ResponsesList: React.FC<ResponsesListProps> = ({ responses }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Survey Responses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Rehire Score</TableHead>
                <TableHead>Can Publish</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.map((response) => (
                <TableRow key={response.code}>
                  <TableCell>{response.userName}</TableCell>
                  <TableCell className="font-bold">
                    {response.recommendScore}
                  </TableCell>
                  <TableCell className="font-bold">
                    {response.rehireScore}
                  </TableCell>
                  <TableCell>{response.canPublish ? "Yes" : "No"}</TableCell>
                  <TableCell>{formatDate(response.submittedAt)}</TableCell>
                  <TableCell>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value={response.code}>
                        <AccordionTrigger className="py-1">Details</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 p-2">
                            <div>
                              <h4 className="font-semibold">Reason:</h4>
                              <p className="text-sm">{response.recommendReason}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold">Testimonial:</h4>
                              <p className="text-sm">{response.testimonial}</p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </TableCell>
                </TableRow>
              ))}
              {responses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No responses received yet
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

export default ResponsesList;
