
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Company, Project } from "./AdminDashboard";
import { Plus } from "lucide-react";

interface ProjectManagementProps {
  projects: Project[];
  companies: Company[];
  onProjectAdded: (project: Project) => void;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({ 
  projects,
  companies,
  onProjectAdded
}) => {
  const [name, setName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !companyId) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields."
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Insert project into Supabase
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name,
          company_id: companyId
        })
        .select(`
          *,
          companies:company_id (name)
        `)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Transform project data
        const newProject: Project = {
          id: data.id,
          name: data.name,
          company_id: data.company_id,
          company_name: data.companies?.name
        };
        
        onProjectAdded(newProject);
        
        toast({
          title: "Project Added",
          description: `${name} was added successfully.`
        });
        
        // Reset form
        setName("");
        setCompanyId("");
        setIsOpen(false);
      }
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding project",
        description: error.message || "An error occurred while adding the project."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projects</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Select value={companyId} onValueChange={setCompanyId}>
                  <SelectTrigger id="company">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Company</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.company_name}</TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                    No projects added yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectManagement;
