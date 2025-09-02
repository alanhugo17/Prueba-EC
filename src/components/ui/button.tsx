
import * as React from "react";
import { cn } from "@/lib/utils";
type Variant = "default" | "outline" | "ghost";
type Size = "sm" | "md";
const base = "inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:pointer-events-none";
const variants: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground hover:opacity-90",
  outline: "border border-gray-300 bg-white hover:bg-muted",
  ghost:   "hover:bg-muted"
};
const sizes: Record<Size, string> = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm" };
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant="default", size="md", ...props }, ref) => (
  <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
));
Button.displayName = "Button";
export default Button;
