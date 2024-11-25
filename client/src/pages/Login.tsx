// src/store/auth/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Lock, User, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { selectAuthError } from "@/store/auth/authSlice";
import { loginSchema } from "@/types/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const error = useSelector(selectAuthError);
  const [formData, setFormData] = useState({ name: "", password: "" });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      const validatedData = loginSchema.parse(formData);
      await login(validatedData);
    } catch (err) {
      if (err instanceof Error) {
        setValidationErrors({ form: err.message });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="w-[400px] shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold">
              Sign in
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Username"
                    className="pl-10"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                {validationErrors.name && (
                  <p className="text-sm text-red-500">
                    {validationErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-red-500">
                    {validationErrors.password}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-500">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-primary hover:text-primary/80"
                onClick={() => navigate("/register")}
              >
                Sign up
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
