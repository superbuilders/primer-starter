import type {
	InteractionReview,
	RendererChoice,
	RendererInteraction,
	RendererMatchChoice,
	ReviewScalarValue,
} from "@superbuilders/primer-tives/contracts";

import { Inline } from "./content";
import { Label } from "./submission-view";

interface ReviewViewProps {
	interaction: RendererInteraction;
	review: InteractionReview;
}

export function ReviewView({ interaction, review }: ReviewViewProps) {
	return (
		<div data-slot="review-view" className="flex flex-col gap-2">
			<Label>Correct answer</Label>
			<ReviewBody interaction={interaction} review={review} />
		</div>
	);
}

function ReviewBody({ interaction, review }: ReviewViewProps) {
	switch (review.type) {
		case "choice": {
			if (interaction.type !== "choice")
				return <PlainText>{review.correctKeys.join(", ")}</PlainText>;
			return <ChoiceList options={interaction.options} keys={review.correctKeys} />;
		}
		case "text-entry":
			return <PlainText>{review.correctValue ? scalarToText(review.correctValue) : "—"}</PlainText>;
		case "extended-text":
			return (
				<ul className="flex flex-col gap-1.5">
					{review.correctValues.map((value, i) => (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: review provides ordered scalars
							key={i}
							className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
						>
							{scalarToText(value)}
						</li>
					))}
				</ul>
			);
		case "order": {
			if (interaction.type !== "order")
				return <PlainText>{review.correctOrder.join(" → ")}</PlainText>;
			return <OrderList choices={interaction.choices} orderedKeys={review.correctOrder} />;
		}
		case "match": {
			if (interaction.type !== "match")
				return <PlainText>{`${review.correctPairs.length} pairs`}</PlainText>;
			return (
				<PairList
					sources={interaction.sourceChoices}
					targets={interaction.targetChoices}
					pairs={review.correctPairs}
				/>
			);
		}
		case "portable-custom":
			return (
				<ul className="flex flex-col gap-1.5">
					{review.fields.map((field) => (
						<li
							key={field.fieldIdentifier}
							className="flex items-baseline gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
						>
							<span className="font-mono text-xs text-muted-foreground">
								{field.fieldIdentifier}
							</span>
							<span>{field.value ? scalarToText(field.value) : "—"}</span>
						</li>
					))}
				</ul>
			);
	}
}

function ChoiceList({ options, keys }: { options: RendererChoice[]; keys: string[] }) {
	const map = new Map(options.map((o) => [o.identifier, o] as const));
	return (
		<ul className="flex flex-col gap-1.5">
			{keys.map((key) => {
				const opt = map.get(key);
				return (
					<li
						key={key}
						className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-foreground"
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
						className="flex items-center gap-3 rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-foreground"
					>
						<span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success text-xs font-semibold text-success-foreground">
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
						className="flex items-center gap-2 rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-foreground"
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

function PlainText({ children }: { children: React.ReactNode }) {
	return (
		<div className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-foreground">
			{children}
		</div>
	);
}

function scalarToText(value: ReviewScalarValue): string {
	switch (value.kind) {
		case "identifier":
		case "string":
			return value.value;
		case "integer":
		case "float":
			return String(value.value);
		case "pair":
			return `${value.source} → ${value.target}`;
	}
}
