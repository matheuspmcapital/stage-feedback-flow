
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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminUser } from "./AdminDashboard";
import { Plus, User } from "lucide-react";
import bcrypt from "bcryptjs";

interface AdminUserManagementProps {
  adminUsers: AdminUser[];
  onAdminUserAdded: (adminUser: AdminUser) => void;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ 
  adminUsers, 
  onAdminUserAdded 
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields."
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match."
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 8 characters long."
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Check if the email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', email.toLowerCase());
        
      if (checkError) throw checkError;
      
      if (existingUsers && existingUsers.length > 0) {
        toast({
          variant: "destructive",
          title: "Email Already Exists",
          description: "An admin user with this email already exists."
        });
        return;
      }
      
      // Insert admin user into Supabase
      const { data, error } = await supabase
        .from('admin_users')
        .insert({ 
          email: email.toLowerCase(),
          password: hashedPassword
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        onAdminUserAdded(data as AdminUser);
        
        toast({
          title: "Admin User Added",
          description: `${email} was added successfully.`
        });
        
        // Reset form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setIsOpen(false);
      }
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding admin user",
        description: error.message || "An error occurred while adding the admin user."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Admin Users</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Admin User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Admin User"}
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
                <TableHead>Email</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.map((adminUser) => (
                <TableRow key={adminUser.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {adminUser.email}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(adminUser.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {adminUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                    No admin users added yet
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

export default AdminUserManagement;
