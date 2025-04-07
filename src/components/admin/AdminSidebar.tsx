
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { BarChart, Building, Code, Users, LogOut, FileText, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "../Logo";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  userEmail: string;
  userRole: string; // Added userRole prop to interface
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange,
  onLogout,
  userEmail,
  userRole, // Added to props destructuring
}) => {
  const menuItems = [
    {
      title: "Dashboard",
      id: "dashboard",
      icon: BarChart,
    },
    {
      title: "Generated Codes",
      id: "codes",
      icon: Code,
    },
    {
      title: "Companies",
      id: "companies",
      icon: Building,
    },
    {
      title: "Projects",
      id: "projects",
      icon: Code,
    },
    {
      title: "Admin Users",
      id: "admins",
      icon: Users,
    }
  ];

  // Get user initials for avatar
  const getUserInitials = (email: string): string => {
    if (!email) return "AU";
    
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-4">
            <Logo />
            <span className="font-bold text-lg">Admin</span>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      isActive={activeSection === item.id}
                      onClick={() => onSectionChange(item.id)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter>
          <div className="px-4 py-4 border-t">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>{getUserInitials(userEmail)}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate max-w-[140px]">{userEmail}</p>
              </div>
            </div>
            <SidebarMenuButton onClick={onLogout} variant="outline" className="w-full">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
};

export default AdminSidebar;
