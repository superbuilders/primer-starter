import type { ChoiceState } from "@superbuilders/primer-tives/client";
import { useCallback, useState } from "react";

import { Inline } from "../content";
import { Frame } from "../frame";
import { Button } from "../ui/button";
import { cn } from "../ui/cn";

interface ChoiceInteractionProps {
	state: ChoiceState;
	onSubmit: (selectedKeys: string[]) => void;
	isPending: boolean;
}

export function ChoiceInteraction({ state, onSubmit, isPending }: ChoiceInteractionProps) {
	const [selected, setSelected] = useState<string[]>([]);
	const isMulti = state.maxChoices !== 1;

	const handleSelect = useCallback(
		(key: string) => {
			if (isPending) return;
			if (!isMulti) {
				onSubmit([key]);
				return;
			}
			setSelected((prev) => {
				if (prev.includes(key)) return prev.filter((k) => k !== key);
				if (prev.length >= state.maxChoices) return prev;
				return [...prev, key];
			});
		},
		[isMulti, isPending, onSubmit, state.maxChoices],
	);

	const canSubmit = isMulti && selected.length >= state.minChoices && !isPending;

	return (
		<Frame body={state.body} stimulus={state.stimulus} prompt={state.interaction.prompt}>
			<fieldset
				className="grid grid-cols-1 gap-2.5 sm:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]"
				aria-labelledby="primer-prompt"
			>
				{state.options.map((opt) => {
					const isSelected = selected.includes(opt.identifier);
					return (
						<button
							key={opt.identifier}
							type="button"
							aria-pressed={isSelected}
							onClick={() => handleSelect(opt.identifier)}
							disabled={isPending}
							className={cn(
								"flex w-full items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-sm leading-snug text-foreground transition-all",
								"focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
								"disabled:pointer-events-none disabled:opacity-60",
								isSelected
									? "border-foreground/50 bg-foreground/5 shadow-sm"
									: "border-border bg-background hover:border-foreground/30 hover:bg-muted",
							)}
						>
							{isMulti ? (
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
							) : null}
							<span className="flex-1">
								<Inline nodes={opt.content} />
							</span>
						</button>
					);
				})}
			</fieldset>

			{isMulti ? (
				<div className="flex items-center justify-between gap-3">
					<p className="text-xs text-muted-foreground">
						{state.minChoices === state.maxChoices
							? `Select ${state.minChoices}`
							: `Select ${state.minChoices}–${state.maxChoices}`}
						<span className="ml-2">({selected.length} selected)</span>
					</p>
					<Button onClick={() => onSubmit(selected)} disabled={!canSubmit}>
						{isPending ? "Submitting…" : "Submit"}
					</Button>
				</div>
			) : null}
		</Frame>
	);
}
