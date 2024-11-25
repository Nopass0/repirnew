// src/hooks/useProtectedRoute.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/store/auth/authSlice";

export function useProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated;
}
