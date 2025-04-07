
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

interface CodeGeneratorProps {
  onCodeGenerated: (code: string, data: any) => void;
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ onCodeGenerated }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [serviceType, setServiceType] = useState("experience");
  const { toast } = useToast();

  const generateRandomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !company) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields."
      });
      return;
    }
    
    const newCode = generateRandomCode();
    const codeData = {
      name,
      email,
      company,
      serviceType,
      generatedAt: new Date().toISOString(),
      code: newCode
    };
    
    onCodeGenerated(newCode, codeData);
    
    toast({
      title: "Code Generated",
      description: `Code ${newCode} was created successfully.`
    });
    
    // Reset form
    setName("");
    setEmail("");
    setCompany("");
    setServiceType("experience");
  };

  return (
    <Dialog>
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
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company Name"
            />
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
            <Button type="submit">Generate Code</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CodeGenerator;
