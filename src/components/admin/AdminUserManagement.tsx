
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminUser } from "./AdminDashboard";

interface AdminUserManagementProps {
  adminUsers: AdminUser[];
  onAdminUserAdded: (user: AdminUser) => void;
  userRole: string; // Added userRole prop to interface
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ 
  adminUsers, 
  onAdminUserAdded,
  userRole // Added to props destructuring
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const handleAddUser = async () => {
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email and password are required."
      });
      return;
    }
    
    try {
      setIsAdding(true);
      
      // Create a new user using Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true // Auto-confirm the email
      });
      
      if (error) throw error;
      
      if (data.user) {
        const newUser: AdminUser = {
          id: data.user.id,
          email: data.user.email || email,
          created_at: data.user.created_at || new Date().toISOString()
        };
        
        onAdminUserAdded(newUser);
        
        toast({
          title: "Success",
          description: "Admin user added successfully."
        });
        
        // Clear form
        setEmail("");
        setPassword("");
        setIsDialogOpen(false);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding admin user",
        description: error.message || "An error occurred while adding the admin user."
      });
      console.error("Error adding admin user:", error);
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Admin Users</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Admin</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="email">Email</label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password">Password</label>
                <Input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  type="password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddUser}
                disabled={isAdding}
              >
                {isAdding ? "Adding..." : "Add User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-6">
                    No admin users found
                  </TableCell>
                </TableRow>
              ) : (
                adminUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagement;
