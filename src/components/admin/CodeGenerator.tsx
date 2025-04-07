
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Code, Project } from "./AdminDashboard";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CodeGeneratorProps {
  onCodeGenerated: (code: Code) => void;
  projects: Project[];
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ onCodeGenerated, projects }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectId, setProjectId] = useState("");
  const [serviceType, setServiceType] = useState("experience");
  const [language, setLanguage] = useState("pt"); // Default language: Portuguese
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Function to generate a random 8-character alphanumeric code (case sensitive)
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !projectId) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields."
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Generate custom code instead of using DB function
      const randomCode = generateRandomCode();
      
      // Check if the code already exists
      const { data: existingCodes, error: checkError } = await supabase
        .from('survey_codes')
        .select('code')
        .eq('code', randomCode);
      
      if (checkError) throw checkError;
      
      if (existingCodes && existingCodes.length > 0) {
        // If code exists, try again
        toast({
          variant: "destructive",
          title: "Code Generation Error",
          description: "Generated code already exists. Please try again."
        });
        return;
      }
      
      // Insert new code into Supabase
      const { data, error } = await supabase
        .from('survey_codes')
        .insert({
          code: randomCode,
          name,
          email,
          project_id: projectId,
          service_type: serviceType,
          language // Store the selected language
        })
        .select(`
          *,
          projects:project_id (
            name, 
            companies:company_id (name)
          )
        `)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Transform the code data
        const newCode: Code = {
          id: data.id,
          code: data.code,
          name: data.name,
          email: data.email,
          project_id: data.project_id,
          project_name: data.projects?.name,
          company_name: data.projects?.companies?.name,
          service_type: data.service_type,
          language: data.language, // Include language in the returned code
          generated_at: data.generated_at,
          started_at: data.started_at,
          completed_at: data.completed_at
        };
        
        onCodeGenerated(newCode);
        
        toast({
          title: "Code Generated",
          description: `Code ${data.code} was created successfully.`
        });
        
        // Reset form
        setName("");
        setEmail("");
        setProjectId("");
        setServiceType("experience");
        setLanguage("pt");
      }
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error generating code",
        description: error.message || "An error occurred while generating the code."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Client Name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="client@example.com"
          type="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="project">Project</Label>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger id="project">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.length > 0 ? (
              projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name} ({project.company_name})
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-projects">No projects available</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Service Type</Label>
        <RadioGroup value={serviceType} onValueChange={setServiceType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="experience" id="experience" />
            <Label htmlFor="experience">Experience</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="strategy" id="strategy" />
            <Label htmlFor="strategy">Strategy</Label>
          </div>
        </RadioGroup>
      </div>
      <div className="space-y-2">
        <Label>Language</Label>
        <RadioGroup value={language} onValueChange={setLanguage}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pt" id="portuguese" />
            <Label htmlFor="portuguese">Portuguese</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="en" id="english" />
            <Label htmlFor="english">English</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="es" id="spanish" />
            <Label htmlFor="spanish">Spanish</Label>
          </div>
        </RadioGroup>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Generating..." : "Generate Code"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CodeGenerator;
