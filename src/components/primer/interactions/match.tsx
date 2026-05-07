import type { MatchState } from "@superbuilders/primer-tives/client";
import type { MatchPair, RendererMatchChoice } from "@superbuilders/primer-tives/contracts";
import { validateSubmissionForInteraction } from "@superbuilders/primer-tives/contracts";
import { useMemo, useState } from "react";

import { Inline } from "../content";
import { Frame } from "../frame";
import { Button } from "../ui/button";
import { cn } from "../ui/cn";

interface MatchInteractionProps {
	state: MatchState;
	onSubmit: (pairs: MatchPair[]) => void;
	isPending: boolean;
}

export function MatchInteraction({ state, onSubmit, isPending }: MatchInteractionProps) {
	const [pairs, setPairs] = useState<MatchPair[]>([]);
	const [activeSource, setActiveSource] = useState<string | null>(null);
	const sourceCounts = useMemo(() => countUsage(pairs, "source"), [pairs]);
	const targetCounts = useMemo(() => countUsage(pairs, "target"), [pairs]);
	const validation = validateSubmissionForInteraction(state.interaction, { type: "match", pairs });
	const canSubmit = validation.ok && !isPending;

	const hasPair = (source: string, target: string) =>
		pairs.some((pair) => pair.source === source && pair.target === target);

	const canAddPair = (source: RendererMatchChoice, target: RendererMatchChoice) => {
		if (pairs.length >= state.maxAssociations) return false;
		return withinMax(source, sourceCounts) && withinMax(target, targetCounts);
	};

	const handleSourceTap = (sourceId: string) => {
		if (isPending) return;
		setActiveSource((prev) => (prev === sourceId ? null : sourceId));
	};

	const handleTargetTap = (target: RendererMatchChoice) => {
		if (isPending || activeSource === null) return;
		const source = state.sourceChoices.find((choice) => choice.identifier === activeSource);
		if (source === undefined) return;

		setPairs((prev) => {
			const existing = prev.findIndex(
				(pair) => pair.source === source.identifier && pair.target === target.identifier,
			);
			if (existing !== -1) return prev.filter((_, i) => i !== existing);
			if (!canAddPair(source, target)) return prev;
			return [...prev, { source: source.identifier, target: target.identifier }];
		});
	};

	const removePair = (pairToRemove: MatchPair) => {
		setPairs((prev) =>
			prev.filter(
				(pair) => pair.source !== pairToRemove.source || pair.target !== pairToRemove.target,
			),
		);
	};

	return (
		<Frame body={state.body} stimulus={state.stimulus} prompt={state.interaction.prompt}>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<ChoiceColumn
					label="Sources"
					choices={state.sourceChoices}
					activeId={activeSource}
					counts={sourceCounts}
					onChoiceTap={handleSourceTap}
					isPending={isPending}
				/>

				<div className="flex flex-col gap-2">
					<span
						className="text-xs font-medium uppercase text-muted-foreground"
						style={{ letterSpacing: "var(--tracking-label)" }}
					>
						Targets
					</span>
					{state.targetChoices.map((target) => {
						const isPaired = activeSource !== null && hasPair(activeSource, target.identifier);
						const source = state.sourceChoices.find((choice) => choice.identifier === activeSource);
						const canPair = source !== undefined && (isPaired || canAddPair(source, target));
						const disabled = isPending || activeSource === null || !canPair;
						return (
							<button
								key={target.identifier}
								type="button"
								onClick={() => handleTargetTap(target)}
								disabled={disabled}
								aria-pressed={isPaired}
								className={cn(
									"rounded-xl border px-3 py-2.5 text-left text-sm text-foreground transition-all",
									"focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
									isPaired
										? "border-foreground bg-foreground text-background shadow-sm"
										: activeSource !== null && canPair
											? "border-foreground/40 bg-muted hover:border-foreground"
											: "border-border bg-background",
									"disabled:opacity-50",
								)}
							>
								<Inline nodes={target.content} />
							</button>
						);
					})}
				</div>
			</div>

			{pairs.length > 0 ? (
				<PairList
					sources={state.sourceChoices}
					targets={state.targetChoices}
					pairs={pairs}
					onRemove={removePair}
					isPending={isPending}
				/>
			) : null}

			<div className="flex items-center justify-between gap-3">
				<p className="text-xs text-muted-foreground">
					{validation.ok
						? `${pairs.length} / ${state.maxAssociations} matched`
						: validation.issues[0]}
				</p>
				<Button onClick={() => onSubmit(pairs)} disabled={!canSubmit}>
					{isPending ? "Submitting..." : "Submit"}
				</Button>
			</div>
		</Frame>
	);
}

function ChoiceColumn({
	label,
	choices,
	activeId,
	counts,
	onChoiceTap,
	isPending,
}: {
	label: string;
	choices: RendererMatchChoice[];
	activeId: string | null;
	counts: Map<string, number>;
	onChoiceTap: (identifier: string) => void;
	isPending: boolean;
}) {
	return (
		<div className="flex flex-col gap-2">
			<span
				className="text-xs font-medium uppercase text-muted-foreground"
				style={{ letterSpacing: "var(--tracking-label)" }}
			>
				{label}
			</span>
			{choices.map((choice) => {
				const isActive = activeId === choice.identifier;
				const count = counts.get(choice.identifier) ?? 0;
				return (
					<button
						key={choice.identifier}
						type="button"
						onClick={() => onChoiceTap(choice.identifier)}
						disabled={isPending}
						aria-pressed={isActive}
						className={cn(
							"rounded-xl border px-3 py-2.5 text-left text-sm text-foreground transition-all",
							"focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
							isActive
								? "border-foreground bg-foreground text-background shadow-sm"
								: count > 0
									? "border-foreground/40 bg-foreground/5"
									: "border-border bg-background hover:border-foreground/30 hover:bg-muted",
						)}
					>
						<span className="flex items-center justify-between gap-3">
							<span>
								<Inline nodes={choice.content} />
							</span>
							{count > 0 ? <span className="text-xs opacity-70">{count}</span> : null}
						</span>
					</button>
				);
			})}
		</div>
	);
}

function PairList({
	sources,
	targets,
	pairs,
	onRemove,
	isPending,
}: {
	sources: RendererMatchChoice[];
	targets: RendererMatchChoice[];
	pairs: MatchPair[];
	onRemove: (pair: MatchPair) => void;
	isPending: boolean;
}) {
	const sourceMap = new Map(sources.map((source) => [source.identifier, source] as const));
	const targetMap = new Map(targets.map((target) => [target.identifier, target] as const));
	return (
		<ul className="flex flex-col gap-1.5">
			{pairs.map((pair) => {
				const source = sourceMap.get(pair.source);
				const target = targetMap.get(pair.target);
				return (
					<li
						key={`${pair.source}->${pair.target}`}
						className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
					>
						<span>{source ? <Inline nodes={source.content} /> : pair.source}</span>
						<span aria-hidden="true" className="text-muted-foreground">
							→
						</span>
						<span className="flex-1">
							{target ? <Inline nodes={target.content} /> : pair.target}
						</span>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => onRemove(pair)}
							disabled={isPending}
						>
							Remove
						</Button>
					</li>
				);
			})}
		</ul>
	);
}

function countUsage(pairs: MatchPair[], side: "source" | "target") {
	const counts = new Map<string, number>();
	for (const pair of pairs) {
		counts.set(pair[side], (counts.get(pair[side]) ?? 0) + 1);
	}
	return counts;
}

function withinMax(choice: RendererMatchChoice, counts: Map<string, number>) {
	if (choice.matchMax === 0) return true;
	return (counts.get(choice.identifier) ?? 0) < choice.matchMax;
}
