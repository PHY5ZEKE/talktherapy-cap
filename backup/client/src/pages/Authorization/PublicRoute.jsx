import { useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const { authState } = useContext(AuthContext);

  const accessToken = authState.accessToken;
  const userRole = authState.userRole;

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
