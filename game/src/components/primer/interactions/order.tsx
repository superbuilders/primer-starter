import type { OrderState } from "@superbuilders/primer-tives/client";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Inline } from "../content";
import { Frame } from "../frame";
import { Button } from "../ui/button";
import { cn } from "../ui/cn";

interface OrderInteractionProps {
	state: OrderState;
	onSubmit: (orderedKeys: string[]) => void;
	isPending: boolean;
	timer?: ReactNode;
}

export function OrderInteraction({ state, onSubmit, isPending, timer }: OrderInteractionProps) {
	const initial = useMemo(() => state.choices.map((c) => c.identifier), [state.choices]);
	const [order, setOrder] = useState<string[]>(initial);
	const [selected, setSelected] = useState<Set<string>>(new Set(initial));
	const choiceMap = useMemo(
		() => new Map(state.choices.map((c) => [c.identifier, c] as const)),
		[state.choices],
	);

	const move = (key: string, delta: -1 | 1) => {
		setOrder((prev) => {
			const i = prev.indexOf(key);
			const j = i + delta;
			if (i < 0 || j < 0 || j >= prev.length) return prev;
			const next = prev.slice();
			[next[i], next[j]] = [next[j] as string, next[i] as string];
			return next;
		});
	};

	const toggle = (key: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	};

	const orderedSelected = order.filter((k) => selected.has(k));
	const canSubmit =
		orderedSelected.length >= state.minChoices &&
		orderedSelected.length <= state.maxChoices &&
		!isPending;

	return (
		<Frame
			timer={timer}
			body={state.body}
			stimulus={state.stimulus}
			prompt={state.interaction.prompt}
		>
			<ol className="flex flex-col gap-2" aria-labelledby="primer-prompt">
				{order.map((key, i) => {
					const choice = choiceMap.get(key);
					if (!choice) return null;
					const isSelected = selected.has(key);
					return (
						<li key={key} className="flex items-center gap-2">
							<div className="flex flex-col gap-1">
								<button
									type="button"
									aria-label="Move up"
									onClick={() => move(key, -1)}
									disabled={isPending || i === 0}
									className="flex h-5 w-7 items-center justify-center rounded-md border border-border bg-background text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
								>
									▲
								</button>
								<button
									type="button"
									aria-label="Move down"
									onClick={() => move(key, 1)}
									disabled={isPending || i === order.length - 1}
									className="flex h-5 w-7 items-center justify-center rounded-md border border-border bg-background text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
								>
									▼
								</button>
							</div>
							<button
								type="button"
								aria-pressed={isSelected}
								onClick={() => toggle(key)}
								disabled={isPending}
								className={cn(
									"flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm text-foreground transition-all",
									"focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
									isSelected
										? "border-foreground/50 bg-foreground/5 shadow-sm"
										: "border-border bg-background hover:border-foreground/30 hover:bg-muted",
								)}
							>
								<span
									aria-hidden="true"
									className={cn(
										"flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px]",
										isSelected
											? "border-foreground bg-foreground text-background"
											: "border-border bg-background",
									)}
								>
									{isSelected ? "✓" : ""}
								</span>
								<span className="flex-1">
									<Inline nodes={choice.content} />
								</span>
							</button>
						</li>
					);
				})}
			</ol>
			<div className="flex items-center justify-between gap-3">
				<p className="text-xs text-muted-foreground">
					{state.minChoices === state.maxChoices
						? `Order ${state.minChoices}`
						: `Order ${state.minChoices}–${state.maxChoices}`}
					<span className="ml-2">({orderedSelected.length} selected)</span>
				</p>
				<Button onClick={() => onSubmit(orderedSelected)} disabled={!canSubmit}>
					{isPending ? "Submitting…" : "Submit"}
				</Button>
			</div>
		</Frame>
	);
}
