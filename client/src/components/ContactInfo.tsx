import { useStudent } from "@/hooks/useStudent";
import { Phone, MessageCircle } from "lucide-react";
import { Button } from "react-day-picker";
import { Input } from "./ui/input";

// src/components/student/ContactInfo.tsx
export const ContactInfo = () => {
  const { updateCurrentStudent } = useStudent();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Input
          placeholder="Телефон"
          type="tel"
          onChange={(e) =>
            updateCurrentStudent({ phoneNumber: e.target.value })
          }
        />
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Input
        type="email"
        placeholder="Email"
        onChange={(e) => updateCurrentStudent({ email: e.target.value })}
      />
    </div>
  );
};
