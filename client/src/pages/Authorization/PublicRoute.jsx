import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const accessToken = localStorage.getItem("accessToken");
  const userRole = localStorage.getItem("userRole"); // Assuming userRole is stored in localStorage

  if (accessToken) {
    switch (userRole) {
      case "superAdmin":
        return <Navigate to="/sudo" />;
      case "admin":
        return <Navigate to="/admin" />;
      case "clinician":
        return <Navigate to="/clinician" />;
      case "patientslp":
        return <Navigate to="/patient" />;
      default:
        return <Navigate to="/" />;
    }
  }

  return children;
};

export default PublicRoute;
