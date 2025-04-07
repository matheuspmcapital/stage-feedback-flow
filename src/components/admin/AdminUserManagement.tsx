
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminUser } from "./AdminDashboard";
import { Plus, User } from "lucide-react";
import bcrypt from "bcryptjs";

interface AdminUserManagementProps {
  adminUsers: AdminUser[];
  onAdminUserAdded: (adminUser: AdminUser) => void;
  userRole: string;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ 
  adminUsers, 
  onAdminUserAdded,
  userRole
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("partner");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

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
    
    if (userRole !== 'full-admin') {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Only full admins can add new users."
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // First create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: password,
        options: {
          data: {
            role: role
          }
        }
      });
      
      if (authError) throw authError;
      
      // Hash the password before storing in admin_users table
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Check if the email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', email.toLowerCase());
        
      if (checkError) throw checkError;
      
      if (existingUsers && existingUsers.length > 0) {
        throw new Error("An admin user with this email already exists.");
      }
      
      // Insert admin user into Supabase
      const { data, error } = await supabase
        .from('admin_users')
        .insert({ 
          email: email.toLowerCase(),
          password: hashedPassword,
          role: role
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Convert the result to AdminUser type
        const newAdminUser: AdminUser = {
          id: data.id,
          email: data.email,
          role: data.role || role, // Make sure we have a fallback
          created_at: data.created_at
        };
        
        onAdminUserAdded(newAdminUser);
        
        toast({
          title: "Admin User Added",
          description: `${email} was added as a ${role}.`
        });
        
        // Reset form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setRole("partner");
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

  // Only full admins can see this page
  if (userRole !== 'full-admin') {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-muted-foreground">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
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
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="full-admin">Full Admin</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Full admins can add/edit users. Partners can only view other sections.
                </p>
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
                <TableHead>Role</TableHead>
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
                  <TableCell className="capitalize">{adminUser.role || 'partner'}</TableCell>
                  <TableCell>{formatDate(adminUser.created_at)}</TableCell>
                </TableRow>
              ))}
              {adminUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
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
