// components/calendar/PointsRating.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Star, StarHalf } from "lucide-react";

interface PointsRatingProps {
  value: number;
  onChange: (points: number) => void;
}

export const PointsRating: React.FC<PointsRatingProps> = ({
  value,
  onChange,
}) => {
  const handlePointClick = (point: number) => {
    onChange(point);
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const isHalf = starValue - value < 1 && starValue - value !== 0;

        return (
          <Button
            key={starValue}
            variant="outline"
            size="icon"
            onClick={() => handlePointClick(starValue)}
          >
            {isHalf ? (
              <StarHalf className="h-4 w-4" />
            ) : (
              <Star className="h-4 w-4" />
            )}
          </Button>
        );
      })}
    </div>
  );
};
