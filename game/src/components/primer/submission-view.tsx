import type {
	FractionInputSubmission,
	RendererChoice,
	RendererInteraction,
	RendererMatchChoice,
	RendererSubmission,
} from "@superbuilders/primer-tives/contracts";
import { cn } from "@/lib/utils";

import { Inline } from "./content";

interface SubmissionViewProps {
	interaction: RendererInteraction;
	submission: RendererSubmission;
}

export function SubmissionView({ interaction, submission }: SubmissionViewProps) {
	return (
		<div data-slot="submission-view" className="flex flex-col gap-2">
			<Label>Your answer</Label>
			<SubmissionBody interaction={interaction} submission={submission} />
		</div>
	);
}

function SubmissionBody({ interaction, submission }: SubmissionViewProps) {
	switch (submission.type) {
		case "choice": {
			if (interaction.type !== "choice")
				return <PlainText>{summarizeKeys(submission.selectedKeys)}</PlainText>;
			return <ChoiceList options={interaction.options} selectedKeys={submission.selectedKeys} />;
		}
		case "text-entry":
			return <PlainText>{submission.value || <Muted>(empty)</Muted>}</PlainText>;
		case "extended-text":
			return (
				<ul className="flex flex-col gap-1">
					{submission.values.map((value, i) => (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: index is the canonical identifier here
							key={i}
							className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
						>
							{value || <Muted>(empty)</Muted>}
						</li>
					))}
				</ul>
			);
		case "order": {
			if (interaction.type !== "order")
				return <PlainText>{summarizeKeys(submission.orderedKeys)}</PlainText>;
			return <OrderList choices={interaction.choices} orderedKeys={submission.orderedKeys} />;
		}
		case "match": {
			if (interaction.type !== "match")
				return <PlainText>{`${submission.pairs.length} pairs`}</PlainText>;
			return (
				<PairList
					sources={interaction.sourceChoices}
					targets={interaction.targetChoices}
					pairs={submission.pairs}
				/>
			);
		}
		case "portable-custom":
			return <FractionView value={submission.value} />;
	}
}

function ChoiceList({
	options,
	selectedKeys,
}: {
	options: RendererChoice[];
	selectedKeys: string[];
}) {
	const map = new Map(options.map((o) => [o.identifier, o] as const));
	return (
		<ul className="flex flex-col gap-1.5">
			{selectedKeys.map((key) => {
				const opt = map.get(key);
				return (
					<li
						key={key}
						className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
					>
						{opt ? <Inline nodes={opt.content} /> : key}
					</li>
				);
			})}
		</ul>
	);
}

function OrderList({ choices, orderedKeys }: { choices: RendererChoice[]; orderedKeys: string[] }) {
	const map = new Map(choices.map((c) => [c.identifier, c] as const));
	return (
		<ol className="flex flex-col gap-1.5">
			{orderedKeys.map((key, i) => {
				const c = map.get(key);
				return (
					<li
						key={key}
						className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
					>
						<span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
							{i + 1}
						</span>
						{c ? <Inline nodes={c.content} /> : key}
					</li>
				);
			})}
		</ol>
	);
}

function PairList({
	sources,
	targets,
	pairs,
}: {
	sources: RendererMatchChoice[];
	targets: RendererMatchChoice[];
	pairs: { source: string; target: string }[];
}) {
	const sMap = new Map(sources.map((s) => [s.identifier, s] as const));
	const tMap = new Map(targets.map((t) => [t.identifier, t] as const));
	return (
		<ul className="flex flex-col gap-1.5">
			{pairs.map((pair, i) => {
				const s = sMap.get(pair.source);
				const t = tMap.get(pair.target);
				return (
					<li
						// biome-ignore lint/suspicious/noArrayIndexKey: pairs use index as ordering token
						key={i}
						className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
					>
						<span>{s ? <Inline nodes={s.content} /> : pair.source}</span>
						<span aria-hidden="true" className="text-muted-foreground">
							→
						</span>
						<span>{t ? <Inline nodes={t.content} /> : pair.target}</span>
					</li>
				);
			})}
		</ul>
	);
}

function FractionView({ value }: { value: FractionInputSubmission }) {
	switch (value.form) {
		case "whole":
			return <PlainText>{value.whole || <Muted>(empty)</Muted>}</PlainText>;
		case "proper":
		case "improper":
			return <FractionStack numerator={value.numerator} denominator={value.denominator} />;
		case "mixed":
			return (
				<div className="flex items-center gap-2 text-base text-foreground">
					<span>{value.whole || "_"}</span>
					<FractionStack numerator={value.numerator} denominator={value.denominator} />
				</div>
			);
	}
}

function FractionStack({ numerator, denominator }: { numerator: string; denominator: string }) {
	return (
		<span className="inline-flex flex-col items-center text-base leading-none text-foreground">
			<span>{numerator || "_"}</span>
			<span className="my-0.5 h-px w-full min-w-[1.5rem] bg-foreground" />
			<span>{denominator || "_"}</span>
		</span>
	);
}

export function Label({ children }: { children: React.ReactNode }) {
	return (
		<span
			className="text-xs font-medium uppercase text-muted-foreground"
			style={{ letterSpacing: "var(--tracking-label)" }}
		>
			{children}
		</span>
	);
}

function PlainText({ children }: { children: React.ReactNode }) {
	return (
		<div className={cn("rounded-md border border-border bg-muted/40 px-3 py-2 text-sm")}>
			{children}
		</div>
	);
}

function Muted({ children }: { children: React.ReactNode }) {
	return <span className="italic text-muted-foreground">{children}</span>;
}

function summarizeKeys(keys: string[]) {
	if (keys.length === 0) return "—";
	return keys.join(", ");
}
