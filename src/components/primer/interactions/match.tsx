"use client";

import type { MatchState } from "@superbuilders/primer-tives/client";
import type { MatchPair, RendererMatchChoice } from "@superbuilders/primer-tives/contracts";
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
	const isSortMode = useMemo(
		() => state.targetChoices.some((t) => t.matchMax !== 1),
		[state.targetChoices],
	);
	if (isSortMode) {
		return <SortMatch state={state} onSubmit={onSubmit} isPending={isPending} />;
	}
	return <PairMatch state={state} onSubmit={onSubmit} isPending={isPending} />;
}

function SortMatch({ state, onSubmit, isPending }: MatchInteractionProps) {
	const [assignments, setAssignments] = useState<Record<string, string>>({});
	const [activeSource, setActiveSource] = useState<string | null>(null);

	const assignedSet = new Set(Object.keys(assignments));
	const unassigned = state.sourceChoices.filter((s) => !assignedSet.has(s.identifier));

	const itemsForTarget = (targetId: string) =>
		Object.entries(assignments)
			.filter(([, t]) => t === targetId)
			.map(([s]) => state.sourceChoices.find((c) => c.identifier === s))
			.filter((c): c is RendererMatchChoice => Boolean(c));

	const handleSourceTap = (id: string) => {
		if (assignedSet.has(id)) {
			setAssignments((prev) => {
				const next = { ...prev };
				delete next[id];
				return next;
			});
			setActiveSource(null);
			return;
		}
		setActiveSource((prev) => (prev === id ? null : id));
	};

	const handleTargetTap = (targetId: string) => {
		if (activeSource === null) return;
		setAssignments((prev) => ({ ...prev, [activeSource]: targetId }));
		setActiveSource(null);
	};

	const pairs: MatchPair[] = Object.entries(assignments).map(([source, target]) => ({
		source,
		target,
	}));
	const canSubmit =
		pairs.length >= state.minAssociations && pairs.length <= state.maxAssociations && !isPending;

	return (
		<Frame body={state.body} stimulus={state.stimulus} prompt={state.interaction.prompt}>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{state.targetChoices.map((target) => (
					<button
						key={target.identifier}
						type="button"
						onClick={() => handleTargetTap(target.identifier)}
						disabled={isPending || activeSource === null}
						className={cn(
							"flex min-h-28 flex-col gap-2 rounded-xl border p-3 text-left transition-all",
							"focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
							activeSource !== null
								? "border-foreground/40 bg-muted hover:border-foreground"
								: "border-border bg-background",
							"disabled:opacity-60",
						)}
					>
						<span className="text-sm font-medium text-foreground">
							<Inline nodes={target.content} />
						</span>
						<div className="flex flex-wrap gap-1.5">
							{itemsForTarget(target.identifier).map((item) => (
								<span
									key={item.identifier}
									className="rounded-md bg-foreground/5 px-2 py-1 text-xs text-foreground"
								>
									<Inline nodes={item.content} />
								</span>
							))}
						</div>
					</button>
				))}
			</div>

			{unassigned.length > 0 ? (
				<div className="flex flex-wrap gap-2">
					{unassigned.map((source) => {
						const isActive = activeSource === source.identifier;
						return (
							<button
								key={source.identifier}
								type="button"
								onClick={() => handleSourceTap(source.identifier)}
								disabled={isPending}
								className={cn(
									"rounded-xl border px-3 py-2 text-sm text-foreground transition-all",
									"focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
									isActive
										? "border-foreground bg-foreground text-background shadow-sm"
										: "border-border bg-background hover:border-foreground/30 hover:bg-muted",
								)}
							>
								<Inline nodes={source.content} />
							</button>
						);
					})}
				</div>
			) : null}

			<div className="flex items-center justify-between gap-3">
				<p className="text-xs text-muted-foreground">
					{`${pairs.length} / ${state.sourceChoices.length} sorted`}
				</p>
				<Button onClick={() => onSubmit(pairs)} disabled={!canSubmit}>
					{isPending ? "Submitting…" : "Submit"}
				</Button>
			</div>
		</Frame>
	);
}

function PairMatch({ state, onSubmit, isPending }: MatchInteractionProps) {
	const [pairs, setPairs] = useState<Record<string, string>>({});
	const [activeSource, setActiveSource] = useState<string | null>(null);

	const sourceFor = (target: string) => Object.entries(pairs).find(([, t]) => t === target)?.[0];

	const handleSourceTap = (id: string) => {
		if (id in pairs) {
			setPairs((prev) => {
				const next = { ...prev };
				delete next[id];
				return next;
			});
			setActiveSource(null);
			return;
		}
		setActiveSource((prev) => (prev === id ? null : id));
	};

	const handleTargetTap = (targetId: string) => {
		if (activeSource === null) {
			const existingSource = sourceFor(targetId);
			if (existingSource !== undefined) {
				setPairs((prev) => {
					const next = { ...prev };
					delete next[existingSource];
					return next;
				});
			}
			return;
		}
		setPairs((prev) => {
			const next = { ...prev };
			for (const [s, t] of Object.entries(next)) if (t === targetId) delete next[s];
			next[activeSource] = targetId;
			return next;
		});
		setActiveSource(null);
	};

	const result: MatchPair[] = Object.entries(pairs).map(([source, target]) => ({
		source,
		target,
	}));
	const canSubmit =
		result.length >= state.minAssociations && result.length <= state.maxAssociations && !isPending;

	return (
		<Frame body={state.body} stimulus={state.stimulus} prompt={state.interaction.prompt}>
			<div className="grid grid-cols-2 gap-3">
				<div className="flex flex-col gap-2">
					<span
						className="text-xs font-medium uppercase text-muted-foreground"
						style={{ letterSpacing: "var(--tracking-label)" }}
					>
						Sources
					</span>
					{state.sourceChoices.map((source) => {
						const paired = source.identifier in pairs;
						const isActive = activeSource === source.identifier;
						return (
							<button
								key={source.identifier}
								type="button"
								onClick={() => handleSourceTap(source.identifier)}
								disabled={isPending}
								className={cn(
									"rounded-xl border px-3 py-2.5 text-left text-sm text-foreground transition-all",
									"focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
									isActive
										? "border-foreground bg-foreground text-background shadow-sm"
										: paired
											? "border-foreground/40 bg-foreground/5"
											: "border-border bg-background hover:border-foreground/30 hover:bg-muted",
								)}
							>
								<Inline nodes={source.content} />
							</button>
						);
					})}
				</div>
				<div className="flex flex-col gap-2">
					<span
						className="text-xs font-medium uppercase text-muted-foreground"
						style={{ letterSpacing: "var(--tracking-label)" }}
					>
						Targets
					</span>
					{state.targetChoices.map((target) => {
						const matchedSource = sourceFor(target.identifier);
						return (
							<button
								key={target.identifier}
								type="button"
								onClick={() => handleTargetTap(target.identifier)}
								disabled={isPending}
								className={cn(
									"rounded-xl border px-3 py-2.5 text-left text-sm text-foreground transition-all",
									"focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
									matchedSource !== undefined
										? "border-foreground/40 bg-foreground/5"
										: "border-border bg-background hover:border-foreground/30 hover:bg-muted",
								)}
							>
								<Inline nodes={target.content} />
							</button>
						);
					})}
				</div>
			</div>

			<div className="flex items-center justify-between gap-3">
				<p className="text-xs text-muted-foreground">
					{`${result.length} / ${state.sourceChoices.length} matched`}
				</p>
				<Button onClick={() => onSubmit(result)} disabled={!canSubmit}>
					{isPending ? "Submitting…" : "Submit"}
				</Button>
			</div>
		</Frame>
	);
}
