import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
	size?: Size;
}

const BASE =
	"inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent font-medium outline-none transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-40";

const VARIANTS: Record<Variant, string> = {
	primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95",
	outline: "border-border bg-background text-foreground hover:bg-muted hover:border-foreground/30",
	ghost: "text-foreground hover:bg-muted",
	destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const SIZES: Record<Size, string> = {
	sm: "h-8 px-3 text-sm",
	md: "h-10 px-5 text-sm",
};

export function Button({
	className,
	variant = "primary",
	size = "md",
	type = "button",
	...props
}: ButtonProps) {
	return (
		<button
			type={type}
			data-slot="button"
			data-variant={variant}
			className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
			{...props}
		/>
	);
}
