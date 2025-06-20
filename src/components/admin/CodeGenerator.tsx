import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Scope } from '@/contexts/NPSContext';

interface CodeGeneratorProps {
  onCodeGenerated: (code: Code) => void;
  projects: Project[];
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ onCodeGenerated, projects }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectId, setProjectId] = useState("");
  const [serviceType, setServiceType] = useState("experience");
  const [scopes, setScopes] = useState<Scope[]>([]);
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
          language,
          scopes // Add scopes to the database insert
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
          language: data.language || 'pt',
          scopes: (data.scopes as Scope[]) || [], // Add scopes to the returned code
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
        setScopes([]); // Reset scopes
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

  const handleScopeChange = (scope: Scope, checked: boolean) => {
    if (checked) {
      setScopes([...scopes, scope]);
    } else {
      setScopes(scopes.filter(s => s !== scope));
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
            <RadioGroupItem value="Experience" id="Experience" />
            <Label htmlFor="Experience">Experience</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Strategy" id="Strategy" />
            <Label htmlFor="Strategy">Strategy</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="NexStage" id="NexStage" />
            <Label htmlFor="NexStage">NexStage</Label>
          </div>
        </RadioGroup>
      </div>
      <div className="space-y-2">
        <Label>Scopes</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="strategy"
              checked={scopes.includes('strategy')}
              onCheckedChange={(checked) => handleScopeChange('strategy', checked as boolean)}
            />
            <Label htmlFor="strategy">Strategy</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="design"
              checked={scopes.includes('design')}
              onCheckedChange={(checked) => handleScopeChange('design', checked as boolean)}
            />
            <Label htmlFor="design">Design</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="solutions"
              checked={scopes.includes('solutions')}
              onCheckedChange={(checked) => handleScopeChange('solutions', checked as boolean)}
            />
            <Label htmlFor="solutions">Solutions</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tech"
              checked={scopes.includes('tech')}
              onCheckedChange={(checked) => handleScopeChange('tech', checked as boolean)}
            />
            <Label htmlFor="tech">Tech</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="m&a"
              checked={scopes.includes('m&a')}
              onCheckedChange={(checked) => handleScopeChange('m&a', checked as boolean)}
            />
            <Label htmlFor="m&a">M&A</Label>
          </div>
        </div>
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
