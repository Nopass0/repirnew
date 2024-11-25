// utils/errorHandling.ts
import { toast } from "@/hooks/use-toast";
import { ValidationError } from "./validation";

export const handleEventError = (error: unknown) => {
  if (error instanceof ValidationError) {
    toast({
      title: "Ошибка валидации",
      description: error.message,
      variant: "destructive",
    });
    return;
  }

  if (error instanceof Error) {
    toast({
      title: "Произошла ошибка",
      description: error.message,
      variant: "destructive",
    });
    return;
  }

  toast({
    title: "Неизвестная ошибка",
    description: "Пожалуйста, попробуйте позже",
    variant: "destructive",
  });
};
