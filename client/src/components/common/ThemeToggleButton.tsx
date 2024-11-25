// src/components/common/ThemeToggleButton.tsx
import { useContext } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTheme } from "@/context/themeContext";

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10"
        onClick={toggleTheme}
      >
        {theme === "light" ? (
          <Sun className="h-6 w-6" />
        ) : (
          <Moon className="h-6 w-6" />
        )}
      </Button>
    </motion.div>
  );
};

export default ThemeToggleButton;
