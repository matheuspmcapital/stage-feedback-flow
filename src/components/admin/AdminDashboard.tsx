import React, { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import NPSChart from "./NPSChart";
import AdminSidebar from "./AdminSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Session } from "@supabase/supabase-js";
import GeneratedCodes from "./GeneratedCodes";
import CompanyManagement from "./CompanyManagement";
import ProjectManagement from "./ProjectManagement";
import DataTable from "./DataTable";

export interface CodeResponse {
  id: string;
  email: string;
  name: string;
  project_name: string;
  code: string;
  company_name: string;
  completed: boolean;
  started_at: string;
  completed_at: string;
  service_type: string;
  score?: number;
  answers: {
    question_id: string;
    answer: string;
  }[];
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  company_id: string;
  company_name?: string;
  created_at: string;
}

export interface Code {
  id: string;
  code: string;
  email: string;
  name: string;
  project_id: string;
  project_name?: string;
  company_name?: string;
  service_type: string;
  language: string;
  generated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  role?: string;
}

const AdminDashboard: React.FC<{ session: Session | null }> = ({ session }) => {
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [codeResponses, setCodeResponses] = useState<CodeResponse[]>([]);
  const [codes, setCodes] = useState<Code[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    responses: 0,
    participation: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [averageResponseTime, setAverageResponseTime] = useState<string>("--");
  const [userRole, setUserRole] = useState<string>("partner");
  const [userEmail, setUserEmail] = useState<string>("");
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message || "An error occurred while signing out."
      });
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleDateString();
  };

  const calculateStats = (codes: Code[]) => {
    const total = codes.length;
    const started = codes.filter(code => code.started_at).length;
    const completed = codes.filter(code => code.completed_at).length;
    const participation = total > 0 ? Math.round((started / total) * 100) : 0;
    
    setStats({
      total,
      pending: total - completed,
      completed,
      responses: started,
      participation,
    });
  };

  const calculateAverageResponseTime = (codes: Code[]) => {
    const completedCodes = codes.filter(
      code => code.started_at && code.completed_at
    );
    
    if (completedCodes.length === 0) {
      return "--";
    }
    
    let totalTime = 0;
    
    completedCodes.forEach(code => {
      const startDate = new Date(code.started_at!);
      const endDate = new Date(code.completed_at!);
      const timeDiff = endDate.getTime() - startDate.getTime(); // in milliseconds
      totalTime += timeDiff;
    });
    
    const avgTimeInMillis = totalTime / completedCodes.length;
    const avgTimeInMinutes = Math.floor(avgTimeInMillis / (1000 * 60));
    const avgTimeInSeconds = Math.floor((avgTimeInMillis % (1000 * 60)) / 1000);
    
    return `${avgTimeInMinutes} min ${avgTimeInSeconds} sec`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const userEmail = session?.user?.email;
        setUserEmail(userEmail || "");
        
        if (userEmail) {
          setUserRole("admin"); // Default role
        }
        
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*');
        
        if (companiesError) throw companiesError;
        
        setCompanies(companiesData || []);
        
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            *,
            companies:company_id (name)
          `);
        
        if (projectsError) throw projectsError;
        
        const transformedProjects: Project[] = (projectsData || []).map(project => ({
          id: project.id,
          name: project.name,
          company_id: project.company_id,
          company_name: project.companies ? project.companies.name : 'Unknown',
          created_at: project.created_at
        }));
        
        setProjects(transformedProjects);
        
        const { data: codesData, error: codesError } = await supabase
          .from('survey_codes')
          .select(`
            *,
            projects:project_id (
              name,
              companies:company_id (name)
            )
          `);
        
        if (codesError) throw codesError;
        
        const transformedCodes: Code[] = (codesData || []).map(code => ({
          id: code.id,
          code: code.code,
          email: code.email,
          name: code.name,
          project_id: code.project_id,
          project_name: code.projects ? code.projects.name : 'Unknown',
          company_name: code.projects && code.projects.companies ? code.projects.companies.name : 'Unknown',
          service_type: code.service_type,
          language: code.language || 'pt',
          generated_at: code.generated_at,
          started_at: code.started_at,
          completed_at: code.completed_at
        }));
        
        setCodes(transformedCodes);
        calculateStats(transformedCodes);
        const avgTime = calculateAverageResponseTime(transformedCodes);
        setAverageResponseTime(avgTime);
        
        const { data: answersData, error: answersError } = await supabase
          .from('survey_answers')
          .select('*');
        
        if (answersError) throw answersError;
        
        const processedResponses: CodeResponse[] = transformedCodes
          .filter(code => code.started_at !== null)
          .map(code => {
            const codeAnswers = (answersData || [])
              .filter(answer => answer.survey_code_id === code.id)
              .map(answer => ({
                question_id: answer.question_id,
                answer: typeof answer.answer === 'object' ? JSON.stringify(answer.answer) : answer.answer
              }));
              
            return {
              id: code.id,
              email: code.email,
              name: code.name,
              project_name: code.project_name || 'Unknown',
              code: code.code,
              company_name: code.company_name || 'Unknown',
              completed: code.completed_at !== null,
              started_at: code.started_at || '',
              completed_at: code.completed_at || '',
              service_type: code.service_type,
              score: undefined,
              answers: codeAnswers
            };
          });
          
        setCodeResponses(processedResponses);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: error.message || "An error occurred while fetching data."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [session, toast]);

  const handleCompanyAdded = (company: Company) => {
    setCompanies([...companies, company]);
  };

  const handleProjectAdded = (project: Project) => {
    setProjects([...projects, project]);
  };

  const handleCodeGenerated = (code: Code) => {
    setCodes([...codes, code]);
    calculateStats([...codes, code]);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-64 flex-none">
        <AdminSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
          userEmail={userEmail}
          userRole={userRole}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
        <Tabs value={activeSection} className="space-y-6">
          <TabsContent value="dashboard" className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border-blue-200 dark:border-blue-700/50">
                <CardHeader>
                  <CardTitle className="text-blue-800 dark:text-blue-300">{stats.total}</CardTitle>
                  <CardDescription>Total Codes Generated</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 border-purple-200 dark:border-purple-700/50">
                <CardHeader>
                  <CardTitle className="text-purple-800 dark:text-purple-300">{stats.responses}</CardTitle>
                  <CardDescription>Survey Responses</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 border-green-200 dark:border-green-700/50">
                <CardHeader>
                  <CardTitle className="text-green-800 dark:text-green-300">{stats.participation}%</CardTitle>
                  <CardDescription>Participation Rate</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30 border-amber-200 dark:border-amber-700/50">
                <CardHeader>
                  <CardTitle className="text-amber-800 dark:text-amber-300">{stats.completed}</CardTitle>
                  <CardDescription>Completed Surveys</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 border-red-200 dark:border-red-700/50">
                <CardHeader>
                  <CardTitle className="text-red-800 dark:text-red-300">{stats.pending}</CardTitle>
                  <CardDescription>Pending Responses</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/30 border-indigo-200 dark:border-indigo-700/50">
                <CardHeader>
                  <CardTitle className="text-indigo-800 dark:text-indigo-300">{averageResponseTime}</CardTitle>
                  <CardDescription>Average Response Time</CardDescription>
                </CardHeader>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <NPSChart responses={codeResponses} />
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="codes" className="space-y-6">
            <h1 className="text-3xl font-bold">Generated Codes</h1>
            <GeneratedCodes 
              codes={codes} 
              projects={projects} 
              onCodeGenerated={handleCodeGenerated} 
              formatDate={formatDate}
            />
          </TabsContent>
          
          <TabsContent value="companies" className="space-y-6">
            <h1 className="text-3xl font-bold">Companies Management</h1>
            <CompanyManagement 
              companies={companies} 
              onCompanyAdded={handleCompanyAdded} 
            />
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-6">
            <h1 className="text-3xl font-bold">Projects Management</h1>
            <ProjectManagement 
              projects={projects} 
              companies={companies} 
              onProjectAdded={handleProjectAdded} 
            />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <h1 className="text-3xl font-bold">Survey Data</h1>
            <DataTable responses={codeResponses} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
