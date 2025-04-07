
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code } from "./AdminDashboard";
import { useNPS } from "@/contexts/NPSContext";

interface CodeResponseDetailsProps {
  code: Code;
}

const CodeResponseDetails: React.FC<CodeResponseDetailsProps> = ({ code }) => {
  const { getNPSCategory } = useNPS();
  const [answers, setAnswers] = React.useState<Array<{ question_id: string; answer: string }>>([]);

  React.useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const { data, error } = await supabase
          .from("survey_answers")
          .select("*")
          .eq("survey_code_id", code.id);

        if (error) throw error;
        setAnswers(data || []);
      } catch (error) {
        console.error("Error fetching answers:", error);
      }
    };

    fetchAnswers();
  }, [code.id]);

  const getAnswer = (questionId: string) => {
    const answer = answers.find(a => a.question_id === questionId);
    return answer ? answer.answer : "";
  };

  const recommendScore = parseInt(getAnswer("recommend_score"));
  const rehireScore = parseInt(getAnswer("rehire_score"));
  const recommendReason = getAnswer("recommend_reason");
  const testimonial = getAnswer("testimonial");
  const canPublish = getAnswer("can_publish") === "true";

  // Calculate NPS category
  const npsCategory = !isNaN(recommendScore) ? getNPSCategory(recommendScore) : null;
  const npsCategoryText = npsCategory === "promoter" ? "Promoter" : 
                          npsCategory === "neutral" ? "Neutral" : 
                          npsCategory === "detractor" ? "Detractor" : "Unknown";
  const npsCategoryColor = npsCategory === "promoter" ? "bg-green-500" : 
                           npsCategory === "neutral" ? "bg-amber-500" : 
                           npsCategory === "detractor" ? "bg-red-500" : "bg-gray-500";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Respondent Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="font-medium">{code.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{code.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Project</p>
              <p>{code.project_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Company</p>
              <p>{code.company_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Service Type</p>
              <Badge variant={code.service_type === "experience" ? "default" : "outline"}>{code.service_type}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Survey Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendScore > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground">NPS Category</p>
                <Badge className={`${npsCategoryColor} mt-1`}>{npsCategoryText}</Badge>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Code Generated</p>
              <p>{new Date(code.generated_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Started</p>
              <p>{code.started_at ? new Date(code.started_at).toLocaleString() : "Not started"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p>{code.completed_at ? new Date(code.completed_at).toLocaleString() : "Not completed"}</p>
            </div>
            {code.started_at && code.completed_at && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Spent</p>
                <p>
                  {(() => {
                    const startTime = new Date(code.started_at).getTime();
                    const endTime = new Date(code.completed_at).getTime();
                    const diffInSeconds = Math.floor((endTime - startTime) / 1000);
                    const minutes = Math.floor(diffInSeconds / 60);
                    const seconds = diffInSeconds % 60;
                    return `${minutes}m ${seconds}s`;
                  })()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {answers.length > 0 ? (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Survey Response Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recommendation Score</p>
                    <div className="text-3xl font-bold mt-1">{!isNaN(recommendScore) ? recommendScore : "-"}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rehire Score</p>
                    <div className="text-3xl font-bold mt-1">{!isNaN(rehireScore) ? rehireScore : "-"}</div>
                  </div>
                </div>
                {recommendReason && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recommendation Reason</p>
                    <div className="p-3 bg-muted rounded-md mt-1 text-sm">{recommendReason}</div>
                  </div>
                )}
                {testimonial && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Testimonial</p>
                    <div className="p-3 bg-muted rounded-md mt-1 text-sm">{testimonial}</div>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Can Publish Testimonial</p>
                  <p className="mt-1">{canPublish ? "Yes" : "No"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Raw Response Data</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <pre className="text-xs">{JSON.stringify(answers, null, 2)}</pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No survey responses recorded yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CodeResponseDetails;
