
import * as React from "react";
import { cn } from "@/lib/utils";
type Variant = "default" | "secondary" | "outline";
const variants: Record<Variant,string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-muted text-muted-foreground",
  outline: "border border-gray-300 text-gray-700"
};
export function Badge({ className, variant="default", ...p }: React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  return <div className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs", variants[variant], className)} {...p} />;
}
