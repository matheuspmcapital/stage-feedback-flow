
import React, { useMemo } from "react";
import { CodeResponse } from "./AdminDashboard";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DataTableProps {
  responses: CodeResponse[];
}

const DataTable: React.FC<DataTableProps> = ({ responses }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Extract all unique question IDs from the responses
  const questionIds = useMemo(() => {
    const allIds = new Set<string>();
    responses.forEach(response => {
      response.answers.forEach(answer => {
        allIds.add(answer.question_id);
      });
    });
    
    // Define question order for better presentation
    const orderedIds = [
      'recommend_score',
      'rehire_score',
      'improve',
      'good_points',
      'testimonial'
    ];
    
    // Return ordered IDs first, then any other IDs found
    const result = orderedIds.filter(id => allIds.has(id));
    allIds.forEach(id => {
      if (!orderedIds.includes(id)) {
        result.push(id);
      }
    });
    
    return result;
  }, [responses]);

  // Get human-readable question names
  const getQuestionName = (questionId: string): string => {
    const questionMap: { [key: string]: string } = {
      'recommend_score': 'Recommendation Score',
      'rehire_score': 'Rehire Score',
      'improve': 'Areas to Improve',
      'good_points': 'Positive Points',
      'testimonial': 'Testimonial',
    };
    
    return questionMap[questionId] || questionId;
  };

  // Filter responses based on search term
  const filteredResponses = useMemo(() => {
    return responses.filter(response => 
      (response.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       response.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       response.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       response.project_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [responses, searchTerm]);

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Survey Responses Data</CardTitle>
            <CardDescription>
              Complete record of all survey responses with details
            </CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px] font-medium">Respondent</TableHead>
                <TableHead className="w-[150px] font-medium">Company</TableHead>
                <TableHead className="w-[150px] font-medium">Project</TableHead>
                {questionIds.map(id => (
                  <TableHead key={id} className="font-medium">{getQuestionName(id)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResponses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3 + questionIds.length} className="text-center py-8">
                    No responses found
                  </TableCell>
                </TableRow>
              ) : (
                filteredResponses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{response.name}</div>
                        <div className="text-xs text-muted-foreground">{response.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{response.company_name}</TableCell>
                    <TableCell>{response.project_name}</TableCell>
                    {questionIds.map(questionId => {
                      const answer = response.answers.find(a => a.question_id === questionId);
                      let displayValue = answer ? answer.answer : "-";
                      
                      // Format score values for better readability
                      if (questionId === 'recommend_score' || questionId === 'rehire_score') {
                        displayValue = answer ? `${answer.answer}/10` : "-";
                      }
                      
                      return (
                        <TableCell key={questionId}>
                          {displayValue.length > 100 
                            ? `${displayValue.substring(0, 100)}...` 
                            : displayValue}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataTable;
