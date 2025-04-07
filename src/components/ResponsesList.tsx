
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
import { CodeResponse } from "./admin/AdminDashboard";
import { Badge } from "./ui/badge";
import { useNPS } from "@/contexts/NPSContext";

interface ResponsesListProps {
  responses: CodeResponse[];
  isPreview: boolean;
}

// Map question IDs to full questions text
const questionMap: Record<string, string> = {
  "recommend_score": "How likely are you to recommend our services to a friend or colleague?",
  "recommend_reason": "What's the main reason for your score?",
  "rehire_score": "How likely are you to work with us again?",
  "testimonial": "Would you like to share a testimonial about your experience?",
  "can_publish": "Can we publish your feedback publicly?"
};

const ResponsesList: React.FC<ResponsesListProps> = ({ responses, isPreview }) => {
  const { getNPSCategory } = useNPS();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Extract score from answers
  const getScore = (response: CodeResponse) => {
    const scoreAnswer = response.answers.find(a => 
      a.question_id === 'recommend_score'
    );
    return scoreAnswer ? parseInt(scoreAnswer.answer, 10) : 0;
  };
  
  // Get NPS category
  const getNPSCategoryForResponse = (response: CodeResponse) => {
    const score = getScore(response);
    return getNPSCategory(score);
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
    const reasonAnswer = response.answers.find(a => a.question_id === 'recommend_reason');
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
                <TableHead>Category</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.map((response) => {
                const npsCategory = getNPSCategoryForResponse(response);
                const npsCategoryText = npsCategory === "promoter" ? "Promoter" : 
                                       npsCategory === "neutral" ? "Neutral" : 
                                       "Detractor";
                                       
                const npsCategoryColor = npsCategory === "promoter" ? "bg-green-500" : 
                                        npsCategory === "neutral" ? "bg-amber-500" : 
                                        "bg-red-500";
                return (
                  <TableRow key={response.id}>
                    <TableCell>{response.name}</TableCell>
                    <TableCell className="font-bold">
                      {getScore(response)}
                    </TableCell>
                    <TableCell>
                      <Badge className={npsCategoryColor}>{npsCategoryText}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{response.service_type}</TableCell>
                    <TableCell>{formatDate(response.completed_at || response.started_at)}</TableCell>
                    <TableCell>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value={response.id}>
                          <AccordionTrigger className="py-1">Details</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 p-2">
                              <div>
                                <h4 className="font-semibold">{questionMap['recommend_reason']}:</h4>
                                <p className="text-sm">{getRecommendReason(response)}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold">{questionMap['testimonial']}:</h4>
                                <p className="text-sm">{getTestimonial(response)}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold">Rehire Score:</h4>
                                <p className="text-sm font-medium">{getRehireScore(response)}</p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                );
              })}
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
