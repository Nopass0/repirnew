// src/features/routes/ProtectedRoute.tsx
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useProtectedRoute();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}
