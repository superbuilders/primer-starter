import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface QuestionTimerProps {
	durationMs: number;
	isPending: boolean;
	onExpire: () => void;
}

export function QuestionTimer({ durationMs, isPending, onExpire }: QuestionTimerProps) {
	// Use a ref to store the deadline to avoid resetting on re-renders,
	// but calculate it once on mount.
	const deadlineRef = useRef(Date.now() + durationMs);

	// Track seconds for the text label and urgency styling
	const [remainingSeconds, setRemainingSeconds] = useState(Math.ceil(durationMs / 1000));

	const barRef = useRef<HTMLDivElement>(null);
	const frameRef = useRef<number>(0);
	const isPendingRef = useRef(isPending);
	const onExpireRef = useRef(onExpire);

	// Sync refs
	useEffect(() => {
		isPendingRef.current = isPending;
		onExpireRef.current = onExpire;
	}, [isPending, onExpire]);

	useEffect(() => {
		const deadline = deadlineRef.current;
		const totalMs = durationMs;

		const tick = () => {
			if (isPendingRef.current) {
				// Paused, freeze the UI but don't fire expiry
				frameRef.current = requestAnimationFrame(tick);
				return;
			}

			const now = Date.now();
			const remainingMs = Math.max(0, deadline - now);

			// Update text state if whole second changed
			const secs = Math.ceil(remainingMs / 1000);
			setRemainingSeconds((prev) => {
				if (prev !== secs) return secs;
				return prev;
			});

			// Update bar width directly for smooth animation without React re-renders
			if (barRef.current) {
				const percentage = (remainingMs / totalMs) * 100;
				barRef.current.style.width = `${percentage}%`;
			}

			if (remainingMs <= 0) {
				onExpireRef.current();
			} else {
				frameRef.current = requestAnimationFrame(tick);
			}
		};

		frameRef.current = requestAnimationFrame(tick);

		return () => {
			if (frameRef.current) cancelAnimationFrame(frameRef.current);
		};
	}, [durationMs]);

	const isUrgent = remainingSeconds <= 10 && remainingSeconds > 0;
	const isCritical = remainingSeconds <= 5 && remainingSeconds > 0;
	const isExpired = remainingSeconds <= 0;

	return (
		<div className="flex flex-col gap-1.5 w-full max-w-sm mb-4" aria-live="polite">
			<div className="flex items-center justify-between text-xs font-medium">
				<span
					className={cn(
						"transition-colors",
						isCritical
							? "text-destructive"
							: isUrgent
								? "text-amber-600 dark:text-amber-500"
								: "text-muted-foreground",
						isExpired && "text-destructive font-semibold",
					)}
				>
					{isExpired ? "Time's up..." : `${remainingSeconds}s remaining`}
				</span>
			</div>
			<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
				<div
					ref={barRef}
					className={cn(
						"h-full rounded-full transition-colors ease-linear",
						isCritical
							? "bg-destructive"
							: isUrgent
								? "bg-amber-600 dark:bg-amber-500"
								: "bg-foreground",
					)}
					style={{ width: "100%" }}
				/>
			</div>
		</div>
	);
}
