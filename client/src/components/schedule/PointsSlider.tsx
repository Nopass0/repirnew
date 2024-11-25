import React from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PointsSliderProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  className?: string;
}

export const PointsSlider: React.FC<PointsSliderProps> = ({
  value,
  onChange,
  max = 5,
  className,
}) => {
  const [hoveredValue, setHoveredValue] = React.useState<number | null>(null);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handlePointClick = (newValue: number) => {
    setIsAnimating(true);
    onChange(newValue);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      {Array.from({ length: max }).map((_, index) => {
        const pointValue = index + 1;
        const isActive = pointValue <= (hoveredValue ?? value);
        const shouldAnimate = isAnimating && pointValue <= value;

        return (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className={cn(
              "relative w-8 h-8 rounded-full transition-colors",
              isActive && "bg-primary/10",
            )}
            onMouseEnter={() => setHoveredValue(pointValue)}
            onMouseLeave={() => setHoveredValue(null)}
            onClick={() => handlePointClick(pointValue)}
          >
            <Star
              className={cn(
                "w-5 h-5 transition-colors",
                isActive
                  ? "fill-primary text-primary"
                  : "text-muted-foreground",
              )}
            />
            {shouldAnimate && (
              <motion.div
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.2 }}
                exit={{ scale: 2, opacity: 0 }}
                className="absolute inset-0 bg-primary rounded-full"
              />
            )}
          </Button>
        );
      })}
      <span className="ml-2 text-sm font-medium">
        {value} из {max}
      </span>
    </div>
  );
};

export default PointsSlider;
