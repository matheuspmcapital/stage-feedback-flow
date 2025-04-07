
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NPSChart from "./NPSChart";
import CodesList from "./CodesList";
import ResponsesList from "./ResponsesList";
import CodeGenerator from "./CodeGenerator";
import { Button } from "@/components/ui/button";
import Logo from "../Logo";
import CompanyManagement from "./CompanyManagement";
import ProjectManagement from "./ProjectManagement";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Interfaces for our data types
export interface Company {
  id: string;
  name: string;
  cnpj: string;
}

export interface Project {
  id: string;
  name: string;
  company_id: string;
  company_name?: string;
}

export interface Code {
  id: string;
  code: string;
  name: string;
  email: string;
  project_id: string;
  project_name?: string;
  company_name?: string;
  service_type: string;
  generated_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface Response {
  userName: string;
  code: string;
  recommendScore: number;
  recommendReason: string;
  rehireScore: number;
  testimonial: string;
  canPublish: boolean;
  submittedAt: string;
}

const AdminDashboard: React.FC = () => {
  const [codes, setCodes] = useState<Code[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const handleLogout = () => {
    // In a real app, would clear auth state
    window.location.href = "/";
  };
  
  // Load all data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .order('name');
        
        if (companiesError) throw companiesError;
        setCompanies(companiesData || []);
        
        // Fetch projects with company info
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            *,
            companies:company_id (name)
          `)
          .order('name');
        
        if (projectsError) throw projectsError;
        
        // Transform projects data
        const transformedProjects = projectsData.map(project => ({
          id: project.id,
          name: project.name,
          company_id: project.company_id,
          company_name: project.companies?.name
        }));
        
        setProjects(transformedProjects || []);
        
        // Fetch survey codes with project info
        const { data: codesData, error: codesError } = await supabase
          .from('survey_codes')
          .select(`
            *,
            projects:project_id (
              name, 
              companies:company_id (name)
            )
          `)
          .order('generated_at', { ascending: false });
        
        if (codesError) throw codesError;
        
        // Transform codes data
        const transformedCodes = codesData.map(code => ({
          id: code.id,
          code: code.code,
          name: code.name,
          email: code.email,
          project_id: code.project_id,
          project_name: code.projects?.name,
          company_name: code.projects?.companies?.name,
          service_type: code.service_type,
          generated_at: code.generated_at,
          started_at: code.started_at,
          completed_at: code.completed_at
        }));
        
        setCodes(transformedCodes || []);
        
        // For now, we'll just leave the mock responses
        // but in a real app, we would fetch them from survey_answers
        
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: error.message || "An error occurred while loading data."
        });
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  const handleCodeGenerated = async (newCode: Code) => {
    setCodes([newCode, ...codes]);
  };
  
  const handleCompanyAdded = (company: Company) => {
    setCompanies([...companies, company]);
  };
  
  const handleProjectAdded = (project: Project) => {
    setProjects([...projects, project]);
  };
  
  // Chart data from responses
  const chartData = responses.map(response => ({
    name: response.userName,
    recommendScore: response.recommendScore,
    rehireScore: response.rehireScore
  }));

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-white border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Logo />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </header>
      
      <main className="container mx-auto p-4 py-6 space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Loading data...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">NPS Dashboard</h2>
              <CodeGenerator 
                onCodeGenerated={handleCodeGenerated} 
                projects={projects}
              />
            </div>
            
            <NPSChart data={chartData} />
            
            <Tabs defaultValue="codes" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="codes">Generated Codes</TabsTrigger>
                <TabsTrigger value="responses">Survey Responses</TabsTrigger>
                <TabsTrigger value="companies">Companies</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
              </TabsList>
              
              <TabsContent value="codes">
                <CodesList codes={codes} />
              </TabsContent>
              
              <TabsContent value="responses">
                <ResponsesList responses={responses} />
              </TabsContent>
              
              <TabsContent value="companies">
                <CompanyManagement 
                  companies={companies} 
                  onCompanyAdded={handleCompanyAdded}
                />
              </TabsContent>
              
              <TabsContent value="projects">
                <ProjectManagement 
                  projects={projects} 
                  companies={companies}
                  onProjectAdded={handleProjectAdded}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
