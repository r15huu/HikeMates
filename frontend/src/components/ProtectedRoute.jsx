import { Navigate, useLocation } from "react-router-dom";


export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("access");

  if (!isAuthenticated) {
    // Redirect to login, but save the current location so we can come back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}