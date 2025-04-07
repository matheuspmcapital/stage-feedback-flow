
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

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
      
      // Insert new code into Supabase
      const { data, error } = await supabase
        .from('survey_codes')
        .insert({
          code: Math.floor(100000 + Math.random() * 900000).toString(), // Will use DB function in production
          name,
          email,
          project_id: projectId,
          service_type: serviceType
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
        generated_at: data.generated_at
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
      setIsOpen(false);
      
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto">Generate New Code</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate New NPS Code</DialogTitle>
        </DialogHeader>
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
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} ({project.company_name})
                  </SelectItem>
                ))}
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
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Generating..." : "Generate Code"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CodeGenerator;
