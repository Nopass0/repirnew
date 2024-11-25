import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { selectUser, logout } from "@/store/auth/authSlice";
import {
  ChevronDown,
  FileSearch2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import logo from "@/assets/logo.svg";
import { useSidebar } from "@/hooks/useSidebar";
import { useCalendar } from "@/hooks/useCalendar";
import { SidebarPage, CardType } from "@/types/sidebar";
import { cn } from "@/lib/utils";
import ThemeToggleButton from "../common/ThemeToggleButton";

export function Header() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { setCurrentPage, openCard } = useSidebar();
  const {
    view,
    toggleHidePrices,
    toggleDetailed,
    navigateMonth,
    toggleDatePickerVisibility,
    formatDisplayDate,
  } = useCalendar();

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleAddStudent = () => {
    openCard(CardType.Create);
    setCurrentPage(SidebarPage.StudentCards);
  };

  const handleAddClient = () => {
    openCard(CardType.Create);
    setCurrentPage(SidebarPage.ClientCards);
  };

  const handleAddGroup = () => {
    openCard(CardType.Create);
    setCurrentPage(SidebarPage.GroupCards);
  };

  const handleMainMenuClick = () => {
    setCurrentPage(SidebarPage.Home);
  };

  return (
    <header className="bg-white border-b px-4 h-[55px] flex items-center justify-center">
      <div className="w-full mx-auto flex items-center justify-between">
        <div className="flex items-center flex-row">
          <img
            onClick={handleMainMenuClick}
            src={logo}
            alt="Logo"
            className="h-[55px] cursor-pointer"
          />
          <div className="ml-[20px] flex items-center flex-row gap-x-[5px]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Добавить <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleAddStudent}
                >
                  Ученика
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleAddGroup}
                >
                  Группу
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleAddClient}
                >
                  Заказчика
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleHidePrices}
              className={cn(
                "ml-[10px] gap-2 transition-colors",
                !view.isHidden && "text-green-600 hover:text-green-700",
              )}
            >
              {view.isHidden ? (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Показать ₽</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Скрыть ₽</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDetailed}
              className={cn(
                "gap-2",
                view.isDetailed && "text-green-600 hover:text-green-700",
              )}
            >
              <FileSearch2 className="h-4 w-4" />
              <span>Подробно</span>
            </Button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center flex-row gap-x-[10px]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("prev")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="min-w-[140px] font-semibold"
            onClick={toggleDatePickerVisibility}
          >
            {formatDisplayDate()}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("next")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center flex-row gap-x-[10px]">
          <Button variant="ghost" size="sm">
            Статистика
          </Button>
          <Button variant="ghost" size="sm">
            Личный кабинет
          </Button>
          {/* <ThemeToggleButton /> */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <span>Выход</span>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
