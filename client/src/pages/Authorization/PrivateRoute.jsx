import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const accessToken = localStorage.getItem("accessToken");
  const userRole = localStorage.getItem("userRole");

  if (!accessToken || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
