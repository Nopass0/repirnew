import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "react-day-picker";

// src/components/student/SaveButton.tsx
export const SaveButton = ({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading: boolean;
}) => {
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 1 },
    );

    const footer = document.querySelector("#card-footer");
    if (footer) {
      observer.observe(footer);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <motion.div
      className={cn(
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50",
        !isInView && "opacity-100",
        isInView && "opacity-0 pointer-events-none",
      )}
      initial={{ y: 100 }}
      animate={{ y: isInView ? 100 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        onClick={onClick}
        disabled={isLoading}
        className="h-12 px-8 shadow-lg hover:shadow-xl transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Сохранение...
          </>
        ) : (
          "Сохранить"
        )}
      </Button>
    </motion.div>
  );
};
