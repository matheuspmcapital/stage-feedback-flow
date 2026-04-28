
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
import { Button } from "@/components/ui/button";
import { Search, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSemesterLabel, getCurrentSemesterLabel, buildSemesterOptions } from "@/lib/semester";
import * as XLSX from "xlsx";

interface DataTableProps {
  responses: CodeResponse[];
}

const DataTable: React.FC<DataTableProps> = ({ responses }) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterSemester, setFilterSemester] = React.useState<string>(getCurrentSemesterLabel());

  const semesterOptions = useMemo(
    () => buildSemesterOptions(responses.map(r => r.generated_at)),
    [responses]
  );

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
    return responses.filter(response => {
      const matchesSearch =
        response.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.project_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSemester =
        filterSemester === "all" || getSemesterLabel(response.generated_at) === filterSemester;
      return matchesSearch && matchesSemester;
    });
  }, [responses, searchTerm, filterSemester]);

  const handleExport = () => {
    const exportData = filteredResponses.map((response) => {
      const row: Record<string, string> = {
        Name: response.name || "",
        Email: response.email || "",
        Company: response.company_name || "",
        Project: response.project_name || "",
        "Semestre/Ano": getSemesterLabel(response.generated_at),
      };
      questionIds.forEach((qId) => {
        const answer = response.answers.find((a) => a.question_id === qId);
        let value = answer ? answer.answer : "";
        if (qId === "recommend_score" || qId === "rehire_score") {
          value = answer ? `${answer.answer}/10` : "";
        }
        row[getQuestionName(qId)] = value;
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `survey-responses-${date}.xlsx`);
  };

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
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Semestre/Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Semestres</SelectItem>
                {semesterOptions.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleExport} variant="default" className="gap-2">
              <Download className="h-4 w-4" />
              Export XLSX
            </Button>
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
                <TableHead className="w-[110px] font-medium">Semestre/Ano</TableHead>
                {questionIds.map(id => (
                  <TableHead key={id} className="font-medium">{getQuestionName(id)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResponses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4 + questionIds.length} className="text-center py-8">
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
                    <TableCell>{getSemesterLabel(response.generated_at)}</TableCell>
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
