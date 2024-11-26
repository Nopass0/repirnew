// src/hooks/useAuth.ts
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginStart, loginSuccess, loginFailure } from "@/store/auth/authSlice";
import type {
  LoginInput,
  RegisterInput,
  AuthResponse,
  ErrorResponse,
} from "@/types/auth";

const API_BASE = "/api/v1/auth"; // Обновленный базовый путь

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (data: LoginInput) => {
    try {
      dispatch(loginStart());
      setIsLoading(true);

      console.log("Attempting login with:", data); // Отладочный лог

      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();
      console.log("Login response:", result); // Отладочный лог

      if (!response.ok) {
        throw new Error(result.error || "Login failed");
      }

      const authResponse = result as AuthResponse;
      dispatch(
        loginSuccess({
          user: authResponse.data.user,
          token: authResponse.data.token,
        }),
      );

      localStorage.setItem("token", authResponse.data.token);
      setAuthToken(authResponse.data.token);

      navigate("/");
    } catch (error) {
      console.error("Login error:", error); // Отладочный лог
      dispatch(
        loginFailure(error instanceof Error ? error.message : "Login failed"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    try {
      dispatch(loginStart());
      setIsLoading(true);

      if ("email" in data) {
        delete data.email;
      }

      console.log("Attempting registration with:", data); // Отладочный лог

      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();
      console.log("Registration response:", result); // Отладочный лог

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      const authResponse = result as AuthResponse;
      dispatch(
        loginSuccess({
          user: authResponse.data.user,
          token: authResponse.data.token,
        }),
      );

      localStorage.setItem("token", authResponse.data.token);
      setAuthToken(authResponse.data.token);

      navigate("/");
    } catch (error) {
      console.error("Registration error:", error); // Отладочный лог
      dispatch(
        loginFailure(
          error instanceof Error ? error.message : "Registration failed",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifyToken = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(`${API_BASE}/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const result = await response.json();
      console.log("Token verification response:", result); // Отладочный лог

      if (!response.ok) {
        throw new Error("Token verification failed");
      }

      return result.success;
    } catch (error) {
      console.error("Token verification error:", error); // Отладочный лог
      dispatch(loginFailure("Session expired"));
      return false;
    }
  };

  return {
    login,
    register,
    verifyToken,
    isLoading,
  };
}

// Утилиты для работы с токеном
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthHeaders = () => {
  if (!authToken) {
    authToken = localStorage.getItem("token");
  }

  return {
    Authorization: authToken ? `Bearer ${authToken}` : "",
    "Content-Type": "application/json",
  };
};

// API клиент
export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`/api/v1${endpoint}`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return response.json();
  },

  post: async (endpoint: string, data: any) => {
    const response = await fetch(`/api/v1${endpoint}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    });
    return response.json();
  },
};
