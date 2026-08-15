import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth, type Role } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

interface Props {
  roles?: Role[];
  children?: ReactNode;
}

export function ProtectedRoute({ roles, children }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (roles && roles.length && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }
  return children ? <>{children}</> : <Outlet />;
}
