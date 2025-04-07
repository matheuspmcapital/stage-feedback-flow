
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Code } from "./AdminDashboard";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CodeResponseDetailsProps {
  code: Code;
}

interface SurveyResponse {
  question_id: string;
  answer: string;
}

interface FormattedResponse {
  recommendScore?: string;
  recommendReason?: string;
  rehireScore?: string; 
  testimonial?: string;
  canPublish?: boolean;
}

const CodeResponseDetails: React.FC<CodeResponseDetailsProps> = ({ code }) => {
  const [responses, setResponses] = useState<FormattedResponse>({});
  const [isLoading, setIsLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState<string>('-');

  // Format date to dd/mm/yy HH:MM:SS
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "--";
    
    const date = new Date(dateString);
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(2);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const fetchResponses = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('survey_answers')
          .select('*')
          .eq('survey_code_id', code.id);
        
        if (error) throw error;
        
        // Format the responses
        if (data && data.length > 0) {
          const formatted: FormattedResponse = {};
          
          data.forEach((item: SurveyResponse) => {
            switch (item.question_id) {
              case 'recommend_score':
                formatted.recommendScore = item.answer;
                break;
              case 'recommend_reason':
                formatted.recommendReason = item.answer;
                break;
              case 'rehire_score':
                formatted.rehireScore = item.answer;
                break;
              case 'testimonial':
                formatted.testimonial = item.answer;
                break;
              case 'can_publish':
                formatted.canPublish = item.answer.toLowerCase() === 'true';
                break;
            }
          });
          
          setResponses(formatted);
        }

        // Calculate time spent
        if (code.started_at && code.completed_at) {
          const start = new Date(code.started_at).getTime();
          const end = new Date(code.completed_at).getTime();
          const diffInSeconds = Math.floor((end - start) / 1000);
          
          const minutes = Math.floor(diffInSeconds / 60);
          const seconds = diffInSeconds % 60;
          
          setTimeSpent(`${minutes}m ${seconds}s`);
        }
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResponses();
  }, [code]);

  return (
    <ScrollArea className="h-[calc(100vh-180px)]">
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium">Name</p>
            <p>{code.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Email</p>
            <p>{code.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Project</p>
            <p>{code.project_name || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Company</p>
            <p>{code.company_name || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Service Type</p>
            <p>
              <Badge variant={code.service_type === "experience" ? "default" : "outline"}>
                {code.service_type}
              </Badge>
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Status</p>
            <p>
              {code.completed_at ? (
                <Badge className="bg-green-500">Completed</Badge>
              ) : code.started_at ? (
                <Badge className="bg-orange-400">Started</Badge>
              ) : (
                <Badge variant="outline">Pending</Badge>
              )}
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Generated</p>
            <p>{formatDate(code.generated_at)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Started</p>
            <p>{formatDate(code.started_at)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Completed</p>
            <p>{formatDate(code.completed_at)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Time Spent</p>
            <p>{timeSpent}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center">Loading responses...</div>
        ) : Object.keys(responses).length > 0 ? (
          <>
            <Separator />
            <div className="space-y-4 overflow-y-auto">
              <h3 className="text-lg font-semibold">Survey Responses</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Recommendation Score</p>
                  <p className="text-2xl font-bold">{responses.recommendScore || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Recommendation Reason</p>
                  <p className="p-2 bg-muted rounded-md">{responses.recommendReason || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Rehire Score</p>
                  <p className="text-2xl font-bold">{responses.rehireScore || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Testimonial</p>
                  <p className="p-2 bg-muted rounded-md">{responses.testimonial || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Can Publish</p>
                  <p>{responses.canPublish ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No responses received yet
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default CodeResponseDetails;
