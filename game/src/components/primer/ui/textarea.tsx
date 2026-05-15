import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const BASE =
	"w-full min-w-0 resize-y rounded-lg border border-input bg-background px-3 py-2 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 md:text-sm";

export function Textarea({ className, rows = 3, ...props }: TextareaProps) {
	return <textarea data-slot="textarea" rows={rows} className={cn(BASE, className)} {...props} />;
}
