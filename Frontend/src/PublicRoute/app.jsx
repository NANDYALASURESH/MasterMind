import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const PublicRoute = ({ children }) => {
  const token = Cookies.get("jwt_token");

  if (token) {
    // User is logged in — redirect to home
    return <Navigate to="/home" replace />;
  }

  // User is not logged in — allow access to login/signup
  return children;
};

export default PublicRoute;
