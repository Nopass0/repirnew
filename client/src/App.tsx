// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { MainLayout } from "@/components/layout/MainLayout";
import { selectIsAuthenticated } from "@/store/auth/authSlice";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import MainPage from "@/pages/Main";
import Statistics from "@/pages/Statistics";

// Компонент для защищенных маршрутов с layout
function ProtectedRoutes() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </ProtectedRoute>
  );
}

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <Router>
      <Routes>
        {/* Публичные маршруты */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
        />

        {/* Защищенные маршруты с layout */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/students" element={<div>Students Page</div>} />
          <Route path="/schedule" element={<div>Schedule Page</div>} />
          <Route path="/lessons" element={<div>Lessons Page</div>} />
          <Route path="/clients" element={<div>Clients Page</div>} />
          <Route path="/projects" element={<div>Projects Page</div>} />
          <Route path="/settings" element={<div>Settings Page</div>} />
        </Route>

        {/* Перенаправление неизвестных маршрутов */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
