
import * as React from "react";
import { cn } from "@/lib/utils";
export function Separator({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className={cn("h-px w-full bg-gray-200", className)} {...p} />;
}
