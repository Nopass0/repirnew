// src/components/layout/Sidebar.tsx
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Users, Group, User, Briefcase, Settings } from "lucide-react";
import { useSidebar } from "@/hooks/useSidebar";

// Компоненты страниц
import HomePage from "@/components/layout/Sidebar/Home";

// Компоненты карт
import CreateStudentCard from "@/components/student/CreateStudentCard";
import CreateGroupCard from "@/components/layout/Sidebar/cards/CreateGroupCard";
import CreateClientCard from "@/components/layout/Sidebar/cards/CreateClientCard";
import { SidebarPage, CardType } from "@/types/sidebar";
import { ScrollArea } from "@radix-ui/react-scroll-area";

export const Sidebar = () => {
  const { getCurrentPage, getCurrentCard } = useSidebar();
  const currentPage = getCurrentPage();
  const currentCard = getCurrentCard();

  const renderContent = () => {
    if (currentCard) {
      switch (currentCard.type) {
        case CardType.Create:
          switch (currentPage) {
            case SidebarPage.StudentCards:
              return <CreateStudentCard />;
            case SidebarPage.GroupCards:
              return <CreateGroupCard />;
            case SidebarPage.ClientCards:
              return <CreateClientCard />;
            default:
              return <HomePage />;
          }
        default:
          return <HomePage />;
      }
    }
    return <HomePage />;
  };

  return (
    <div className="flex ml-2 flex-col w-[396px] max-h-[100vh] ">
      <div className="flex-1 flex flex-col my-2 ml-2 max-h-[100vh]  bg-white rounded-lg">
        <ScrollArea className="flex-1  ">{renderContent()}</ScrollArea>
      </div>
    </div>
  );
};
