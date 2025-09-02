
import * as React from "react";
import { cn } from "@/lib/utils";
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn("flex h-8 w-full rounded-2xl border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";
