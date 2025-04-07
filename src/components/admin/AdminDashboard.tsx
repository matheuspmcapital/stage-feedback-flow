
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import NPSChart from "./NPSChart";
import CodesList from "./CodesList";
import ResponsesList from "./ResponsesList";
import CompanyManagement from "./CompanyManagement";
import ProjectManagement from "./ProjectManagement";
import AdminUserManagement from "./AdminUserManagement";
import GeneratedCodes from "./GeneratedCodes";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [codes, setCodes] = useState<Code[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const handleLogout = () => {
    localStorage.removeItem('adminSession');
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
          .select()
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
        const transformedProjects = projectsData?.map(project => ({
          id: project.id,
          name: project.name,
          company_id: project.company_id,
          company_name: project.companies?.name
        })) || [];
        
        setProjects(transformedProjects);
        
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
        const transformedCodes = codesData?.map(code => ({
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
        })) || [];
        
        setCodes(transformedCodes);
        
        // Fetch admin users
        const { data: adminUsersData, error: adminUsersError } = await supabase
          .from('admin_users')
          .select('id, email, created_at')
          .order('email');
        
        if (adminUsersError) throw adminUsersError;
        setAdminUsers(adminUsersData || []);
        
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
  
  const handleAdminUserAdded = (adminUser: AdminUser) => {
    setAdminUsers([...adminUsers, adminUser]);
  };
  
  // Chart data from responses
  const chartData = responses.map(response => ({
    name: response.userName,
    recommendScore: response.recommendScore,
    rehireScore: response.rehireScore
  }));

  // Render dashboard section with summary cards and charts
  const renderDashboard = () => (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">NPS Dashboard</h2>
        <NPSChart data={chartData} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{codes.length}</p>
            <p className="text-sm text-muted-foreground">Total generated codes</p>
            <button 
              className="text-sm text-blue-500 mt-2" 
              onClick={() => setActiveSection("generatedCodes")}
            >
              View all codes
            </button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Companies & Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{companies.length} / {projects.length}</p>
            <p className="text-sm text-muted-foreground">Companies / Projects</p>
            <div className="flex gap-4 mt-2">
              <button 
                className="text-sm text-blue-500" 
                onClick={() => setActiveSection("companies")}
              >
                Manage Companies
              </button>
              <button 
                className="text-sm text-blue-500" 
                onClick={() => setActiveSection("projects")}
              >
                Manage Projects
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <CodesList codes={codes.slice(0, 5)} />
      <div className="mt-4 flex justify-center">
        <button 
          className="text-sm text-blue-500" 
          onClick={() => setActiveSection("generatedCodes")}
        >
          View all {codes.length} codes
        </button>
      </div>
    </>
  );

  // Content to display based on active section
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-40">
          <p>Loading data...</p>
        </div>
      );
    }

    switch (activeSection) {
      case "dashboard":
        return renderDashboard();
      case "companies":
        return (
          <CompanyManagement 
            companies={companies} 
            onCompanyAdded={handleCompanyAdded}
          />
        );
      case "projects":
        return (
          <ProjectManagement 
            projects={projects} 
            companies={companies}
            onProjectAdded={handleProjectAdded}
          />
        );
      case "adminUsers":
        return (
          <AdminUserManagement 
            adminUsers={adminUsers}
            onAdminUserAdded={handleAdminUserAdded}
          />
        );
      case "generatedCodes":
        return (
          <GeneratedCodes 
            codes={codes}
            onCodeGenerated={handleCodeGenerated}
            projects={projects}
          />
        );
      case "responses":
        return <ResponsesList responses={responses} />;
      default:
        return renderDashboard();
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        <AdminSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
        />

        <SidebarInset>
          <header className="bg-white border-b p-4">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold">
                {activeSection === "dashboard" && "Dashboard"}
                {activeSection === "companies" && "Companies"}
                {activeSection === "projects" && "Projects"}
                {activeSection === "adminUsers" && "Admin Users"}
                {activeSection === "generatedCodes" && "Generated Codes"}
                {activeSection === "responses" && "Survey Responses"}
              </h1>
            </div>
          </header>
          
          <main className="container mx-auto p-4 py-6">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
