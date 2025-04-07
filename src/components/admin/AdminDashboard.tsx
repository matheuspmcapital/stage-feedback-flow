
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
import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, Users, Code as CodeIcon } from "lucide-react";

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
  serviceType: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
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
  const [averageResponseTime, setAverageResponseTime] = useState<string>("--");
  const [userRole, setUserRole] = useState<string>("partner");
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
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
  
  // Calculate average response time
  const calculateAverageResponseTime = (codes: Code[]) => {
    const completedCodes = codes.filter(code => code.started_at && code.completed_at);
    
    if (completedCodes.length === 0) {
      return "--";
    }
    
    const totalTimeInMs = completedCodes.reduce((total, code) => {
      const startTime = new Date(code.started_at!).getTime();
      const endTime = new Date(code.completed_at!).getTime();
      return total + (endTime - startTime);
    }, 0);
    
    const avgTimeMs = totalTimeInMs / completedCodes.length;
    const avgTimeMin = Math.floor(avgTimeMs / (1000 * 60));
    
    return avgTimeMin === 1 ? "1 minute" : `${avgTimeMin} minutes`;
  };
  
  // Load all data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get current user's email
        const { data: { session } } = await supabase.auth.getSession();
        const userEmail = session?.user?.email;
        
        // Fetch user role
        if (userEmail) {
          const { data: userData, error: userError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', userEmail.toLowerCase())
            .single();
          
          if (!userError && userData) {
            setUserRole(userData.role || 'partner');
          }
        }
        
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
        
        // Calculate average response time
        setAverageResponseTime(calculateAverageResponseTime(transformedCodes));
        
        // Fetch admin users
        const { data: adminUsersData, error: adminUsersError } = await supabase
          .from('admin_users')
          .select('*')
          .order('email');
        
        if (adminUsersError) throw adminUsersError;
        
        // Transform admin users data with roles
        const transformedAdminUsers: AdminUser[] = (adminUsersData || []).map(user => ({
          id: user.id,
          email: user.email,
          role: user.role || 'partner', // Default to 'partner' if role is null
          created_at: user.created_at
        }));
        
        setAdminUsers(transformedAdminUsers);
        
        // Fetch survey answers for NPS chart data
        const { data: answersData, error: answersError } = await supabase
          .from('survey_answers')
          .select(`
            answer,
            question_id,
            survey_code:survey_code_id (
              name,
              code,
              service_type
            )
          `);
        
        if (answersError) throw answersError;
        
        // Process survey answers into responses format for charts
        if (answersData) {
          const processedResponses: { [key: string]: any } = {};
          
          answersData.forEach(answer => {
            const code = answer.survey_code?.code || '';
            if (!processedResponses[code]) {
              processedResponses[code] = {
                userName: answer.survey_code?.name || '',
                code,
                serviceType: answer.survey_code?.service_type || '',
              };
            }
            
            if (answer.question_id === 'recommend_score') {
              processedResponses[code].recommendScore = parseInt(answer.answer);
            } else if (answer.question_id === 'recommend_reason') {
              processedResponses[code].recommendReason = answer.answer;
            } else if (answer.question_id === 'rehire_score') {
              processedResponses[code].rehireScore = parseInt(answer.answer);
            } else if (answer.question_id === 'testimonial') {
              processedResponses[code].testimonial = answer.answer;
            } else if (answer.question_id === 'can_publish') {
              processedResponses[code].canPublish = answer.answer === 'true';
            }
          });
          
          // Convert to array and add submittedAt
          const responseArray = Object.values(processedResponses).map(item => ({
            ...item,
            submittedAt: new Date().toISOString(),
          }));
          
          setResponses(responseArray as Response[]);
        }
        
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
  
  const handleCodeGenerated = (newCode: Code) => {
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
  
  // Calculate some quick metrics for the dashboard
  const completedSurveys = codes.filter(c => c.completed_at).length;
  const pendingSurveys = codes.filter(c => !c.started_at).length;
  const progressSurveys = codes.filter(c => c.started_at && !c.completed_at).length;
  const completionRate = codes.length > 0 
    ? Math.round((completedSurveys / codes.length) * 100) 
    : 0;

  // Count by service type
  const strategySurveys = codes.filter(c => c.service_type === 'strategy').length;
  const experienceSurveys = codes.filter(c => c.service_type === 'experience').length;

  // Prepare chart data by service type
  const strategyResponses = responses.filter(r => r.serviceType === 'strategy');
  const experienceResponses = responses.filter(r => r.serviceType === 'experience');
    
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
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-row items-center justify-between pb-2">
                    <p className="text-sm font-medium">Total Surveys</p>
                    <CodeIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{codes.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Strategy: {strategySurveys}, Experience: {experienceSurveys}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-row items-center justify-between pb-2">
                    <p className="text-sm font-medium">Completion Rate</p>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{completionRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {completedSurveys} completed, {pendingSurveys} pending, {progressSurveys} in progress
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-row items-center justify-between pb-2">
                    <p className="text-sm font-medium">Companies & Projects</p>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{companies.length} / {projects.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Companies / Projects in system
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-row items-center justify-between pb-2">
                    <p className="text-sm font-medium">Avg. Response Time</p>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{averageResponseTime}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From {codes.filter(c => c.completed_at).length} completed surveys
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mb-8">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">NPS Dashboard</h3>
                  <NPSChart 
                    data={responses}
                    strategyData={strategyResponses}
                    experienceData={experienceResponses}
                  />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Recent Survey Codes</h3>
                <CodesList 
                  codes={codes.slice(0, 5)} 
                  formatDate={formatDate}
                />
                <div className="mt-4 flex justify-center">
                  <button 
                    className="text-sm text-blue-500" 
                    onClick={() => setActiveSection("generatedCodes")}
                  >
                    View all {codes.length} codes
                  </button>
                </div>
              </CardContent>
            </Card>
          </>
        );
      case "generatedCodes":
        return (
          <GeneratedCodes 
            codes={codes}
            onCodeGenerated={handleCodeGenerated}
            projects={projects}
            formatDate={formatDate}
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
      case "companies":
        return (
          <CompanyManagement 
            companies={companies} 
            onCompanyAdded={handleCompanyAdded}
          />
        );
      case "adminUsers":
        return (
          <AdminUserManagement 
            adminUsers={adminUsers}
            onAdminUserAdded={handleAdminUserAdded}
            userRole={userRole}
          />
        );
      case "responses":
        return <ResponsesList responses={responses} />;
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Dashboard content */}
            </div>
          </>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen overflow-hidden">
        <AdminSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
          userEmail={session?.user?.email || adminUsers.find(u => u.role === userRole)?.email || ''}
          userRole={userRole}
        />

        <SidebarInset className="h-screen overflow-auto">
          <div className="container mx-auto p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">
                {activeSection === "dashboard" && "Dashboard"}
                {activeSection === "generatedCodes" && "Generated Codes"}
                {activeSection === "projects" && "Projects"}
                {activeSection === "companies" && "Companies"}
                {activeSection === "adminUsers" && "Admin Users"}
              </h1>
            </div>
            
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
