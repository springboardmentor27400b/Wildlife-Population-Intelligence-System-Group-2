import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

  const token = localStorage.getItem("token");

  console.log("Token:", token);
  console.log("Token Type:", typeof token);

  if (token === null || token === undefined || token === "") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
