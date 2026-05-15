import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const BASE =
	"h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 md:text-sm";

export function Input({ className, type = "text", ...props }: InputProps) {
	return <input data-slot="input" type={type} className={cn(BASE, className)} {...props} />;
}
