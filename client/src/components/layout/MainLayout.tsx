// src/components/layout/MainLayout.tsx
import { ReactNode } from "react";
import { ThemeProvider } from "../../context/themeContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Toaster } from "sonner";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <ThemeProvider>
      <div className="max-h-[100vh]  bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-2">{children}</main>
          <Toaster />
        </div>
      </div>
    </ThemeProvider>
  );
}
