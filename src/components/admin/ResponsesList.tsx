
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
import { CodeResponse } from "./AdminDashboard";

interface ResponsesListProps {
  responses: CodeResponse[];
  isPreview: boolean;
}

const ResponsesList: React.FC<ResponsesListProps> = ({ responses, isPreview }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Extract score from answers
  const getScore = (response: CodeResponse) => {
    const scoreAnswer = response.answers.find(a => 
      a.question_id === 'nps-score' || 
      a.question_id === 'recommend_score'
    );
    return scoreAnswer ? parseInt(scoreAnswer.answer, 10) : 0;
  };

  // Extract rehire score
  const getRehireScore = (response: CodeResponse) => {
    const rehireAnswer = response.answers.find(a => a.question_id === 'rehire_score');
    return rehireAnswer ? parseInt(rehireAnswer.answer, 10) : 0;
  };

  // Extract testimonial
  const getTestimonial = (response: CodeResponse) => {
    const testimonialAnswer = response.answers.find(a => a.question_id === 'testimonial');
    return testimonialAnswer ? testimonialAnswer.answer : '';
  };

  // Extract recommendation reason
  const getRecommendReason = (response: CodeResponse) => {
    const reasonAnswer = response.answers.find(a => 
      a.question_id === 'recommend_reason' || 
      a.question_id === 'recommendReason'
    );
    return reasonAnswer ? reasonAnswer.answer : '';
  };

  // Check if can publish
  const getCanPublish = (response: CodeResponse) => {
    const publishAnswer = response.answers.find(a => a.question_id === 'can_publish');
    return publishAnswer ? publishAnswer.answer === 'true' : false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isPreview ? "Recent Responses" : "Survey Responses"}</CardTitle>
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
                <TableRow key={response.id}>
                  <TableCell>{response.name}</TableCell>
                  <TableCell className="font-bold">
                    {getScore(response)}
                  </TableCell>
                  <TableCell className="font-bold">
                    {getRehireScore(response)}
                  </TableCell>
                  <TableCell>{getCanPublish(response) ? "Yes" : "No"}</TableCell>
                  <TableCell>{formatDate(response.completed_at || response.started_at)}</TableCell>
                  <TableCell>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value={response.id}>
                        <AccordionTrigger className="py-1">Details</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 p-2">
                            <div>
                              <h4 className="font-semibold">Reason:</h4>
                              <p className="text-sm">{getRecommendReason(response)}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold">Testimonial:</h4>
                              <p className="text-sm">{getTestimonial(response)}</p>
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
