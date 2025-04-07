
import React, { useState, useEffect } from "react";
import AdminLogin from "../components/admin/AdminLogin";
import AdminDashboard from "../components/admin/AdminDashboard";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if session exists in localStorage
  useEffect(() => {
    const checkSession = () => {
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession) {
        setIsLoggedIn(true);
      }
      setIsLoading(false);
    };
    
    checkSession();
  }, []);
  
  const handleLogin = () => {
    localStorage.setItem('adminSession', 'true');
    setIsLoggedIn(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return isLoggedIn ? (
    <AdminDashboard />
  ) : (
    <AdminLogin onLogin={handleLogin} />
  );
};

export default Admin;
