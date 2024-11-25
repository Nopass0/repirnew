import React from "react";
import { Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import BrandTelegram from "@/assets/BrandTelegram.svg";
import BrandWhatsapp from "@/assets/BrandWhatsapp.svg";

interface ContactItemProps {
  icon: React.ReactNode;
  value: string;
  type: "phone" | "email";
  color: string;
}

const SocialIcons = ({ value }: { value: string }) => {
  const copyToClipboard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    toast.success("Скопировано!");
  };

  return (
    <div className="flex gap-1">
      <motion.button
        onClick={copyToClipboard}
        className="w-6 h-6 rounded flex items-center justify-center hover:bg-green-50/80 transition-colors"
        whileHover={{ scale: 1.1 }}
      >
        <img src={BrandWhatsapp} alt="WhatsApp" className="w-4 h-4" />
      </motion.button>
      <motion.button
        onClick={copyToClipboard}
        className="w-6 h-6 rounded flex items-center justify-center hover:bg-blue-50/80 transition-colors"
        whileHover={{ scale: 1.1 }}
      >
        <img src={BrandTelegram} alt="Telegram" className="w-4 h-4" />
      </motion.button>
    </div>
  );
};

const ContactItem = ({ icon, value, type, color }: ContactItemProps) => {
  const [isContentHovered, setIsContentHovered] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    toast.success("Скопировано!");
  };

  // Контейнер с фиксированной высотой для предотвращения скачков
  const containerHeight = type === "phone" ? "h-[38px]" : "h-[32px]";

  return (
    <div className={cn("relative w-full overflow-hidden", containerHeight)}>
      <div className="flex items-center w-full px-2 py-1.5 rounded-md">
        {/* Левая часть с иконкой и текстом */}
        <motion.div
          className="flex items-center gap-2 min-w-0 flex-1"
          onHoverStart={() => setIsContentHovered(true)}
          onHoverEnd={() => setIsContentHovered(false)}
        >
          <motion.div
            className="flex-shrink-0 w-6 h-6 bg-white rounded-md shadow-sm flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-4 h-4" style={{ color }}>
              {icon}
            </div>
          </motion.div>
          <motion.button
            onClick={handleCopy}
            className="truncate text-sm text-left cursor-pointer"
            style={{ color }}
            whileHover={{ x: 3 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {value}
          </motion.button>
        </motion.div>

        {/* Правая часть с социальными иконками или кнопкой копирования */}
        <div className="flex-shrink-0 w-[84px] flex justify-end">
          <AnimatePresence mode="wait">
            {isContentHovered ? (
              <motion.button
                key="copy"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-md
                         bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={handleCopy}
              >
                скопировать
              </motion.button>
            ) : type === "phone" ? (
              <motion.div
                key="social"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
              >
                <SocialIcons value={value} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

interface ContactIconsProps {
  phoneNumber?: string;
  email?: string;
}

export const ContactIcons = ({ phoneNumber, email }: ContactIconsProps) => {
  return (
    <div className="space-y-1 w-full">
      {phoneNumber && (
        <ContactItem
          icon={<Phone className="w-4 h-4" />}
          value={phoneNumber}
          type="phone"
          color="#4CAF50"
        />
      )}
      {email && (
        <ContactItem
          icon={<Mail className="w-4 h-4" />}
          value={email}
          type="email"
          color="#2196F3"
        />
      )}
    </div>
  );
};

export default ContactIcons;
