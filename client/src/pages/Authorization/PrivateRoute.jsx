import { useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { authState } = useContext(AuthContext);

  const accessToken = authState.accessToken;
  const userRole = authState.userRole;

  if (!accessToken || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
