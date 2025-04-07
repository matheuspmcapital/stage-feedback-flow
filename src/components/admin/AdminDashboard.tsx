
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NPSChart from "./NPSChart";
import CodesList from "./CodesList";
import ResponsesList from "./ResponsesList";
import CodeGenerator from "./CodeGenerator";
import { Button } from "@/components/ui/button";
import Logo from "../Logo";

// Mock data for the dashboard
const initialCodes = [
  {
    code: "123456",
    name: "João Silva",
    email: "joao@example.com",
    company: "ABC Corp",
    serviceType: "experience",
    generatedAt: "2025-03-01T12:00:00Z",
    submittedAt: "2025-03-05T15:30:00Z"
  },
  {
    code: "654321",
    name: "Maria Santos",
    email: "maria@example.com",
    company: "XYZ Ltd",
    serviceType: "strategy",
    generatedAt: "2025-03-10T10:00:00Z"
  },
  {
    code: "111222",
    name: "Carlos Oliveira",
    email: "carlos@example.com",
    company: "Tech Solutions",
    serviceType: "experience",
    generatedAt: "2025-03-15T14:00:00Z",
    submittedAt: "2025-03-18T09:45:00Z"
  }
];

const initialResponses = [
  {
    userName: "João Silva",
    code: "123456",
    recommendScore: 9,
    recommendReason: "Excelente serviço e atendimento.",
    rehireScore: 10,
    testimonial: "Foi uma experiência incrível trabalhar com a Stage. Recomendo fortemente.",
    canPublish: true,
    submittedAt: "2025-03-05T15:30:00Z"
  },
  {
    userName: "Carlos Oliveira",
    code: "111222",
    recommendScore: 7,
    recommendReason: "Bom serviço, mas poderia melhorar a comunicação.",
    rehireScore: 8,
    testimonial: "O projeto foi bem executado, mas tivemos alguns atrasos.",
    canPublish: false,
    submittedAt: "2025-03-18T09:45:00Z"
  }
];

const AdminDashboard: React.FC = () => {
  const [codes, setCodes] = useState(initialCodes);
  const [responses, setResponses] = useState(initialResponses);
  
  const handleLogout = () => {
    // In a real app, would clear auth state
    window.location.href = "/";
  };
  
  const handleCodeGenerated = (code: string, data: any) => {
    setCodes([...codes, data]);
  };
  
  // Chart data
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
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">NPS Dashboard</h2>
          <CodeGenerator onCodeGenerated={handleCodeGenerated} />
        </div>
        
        <NPSChart data={chartData} />
        
        <Tabs defaultValue="codes" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="codes">Generated Codes</TabsTrigger>
            <TabsTrigger value="responses">Survey Responses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="codes">
            <CodesList codes={codes} />
          </TabsContent>
          
          <TabsContent value="responses">
            <ResponsesList responses={responses} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
