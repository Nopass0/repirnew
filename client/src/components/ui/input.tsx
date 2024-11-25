import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { IconType } from "react-icons";

interface InputProps extends React.ComponentProps<"input"> {
  variant?: "ghost" | "underline" | "outline" | "solid";
  label?: string;
  error?: string | boolean;
  icon?: IconType;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant = "outline",
      label = false,
      error,
      icon: Icon,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            variant === "ghost" &&
              "bg-transparent border-none focus-visible:ring-ring",
            variant === "underline" &&
              "border-b border-b-input bg-transparent rounded-none",
            variant === "outline" && "border border-input",
            variant === "solid" && "bg-background border border-input",
            Icon && "pl-10",
            className,
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <motion.label
            className={cn(
              "absolute left-3 text-gray-500 pointer-events-none",
              props.value
                ? "text-sm top-1"
                : "text-base top-1/2 transform -translate-y-1/2",
            )}
            initial={{ y: "50%", scale: 1 }}
            animate={{
              y: props.value ? 0 : "50%",
              scale: props.value ? 0.8 : 1,
            }}
          >
            {label}
          </motion.label>
        )}
        {error && (
          <p className="text-red-500 text-sm mt-1">
            {typeof error === "string" ? error : "Ошибка"}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
