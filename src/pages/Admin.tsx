
import React, { useState } from "react";
import AdminLogin from "../components/admin/AdminLogin";
import AdminDashboard from "../components/admin/AdminDashboard";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return isLoggedIn ? (
    <AdminDashboard />
  ) : (
    <AdminLogin onLogin={() => setIsLoggedIn(true)} />
  );
};

export default Admin;
