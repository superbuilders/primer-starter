"use client";

import type { PciInteractionState } from "@superbuilders/primer-tives/client";
import type {
	FractionInputProps,
	FractionInputSubmission,
} from "@superbuilders/primer-tives/contracts";
import { useEffect, useRef, useState } from "react";

import { Frame } from "../../frame";
import { Button } from "../../ui/button";
import { cn } from "../../ui/cn";

type FractionInputState = PciInteractionState & {
	pciId: "urn:primer:pci:fraction-input";
};

interface FractionInputInteractionProps {
	state: FractionInputState;
	onSubmit: (value: FractionInputSubmission) => void;
	isPending: boolean;
}

export function FractionInputInteraction({
	state,
	onSubmit,
	isPending,
}: FractionInputInteractionProps) {
	const props = state.properties;
	const [whole, setWhole] = useState("");
	const [numerator, setNumerator] = useState("");
	const [denominator, setDenominator] = useState("");

	const wholeRef = useRef<HTMLInputElement>(null);
	const numeratorRef = useRef<HTMLInputElement>(null);
	const denominatorRef = useRef<HTMLInputElement>(null);

	const showWhole = props.form === "whole" || props.form === "mixed";
	const showFraction = props.form !== "whole";

	useEffect(() => {
		if (showWhole) wholeRef.current?.focus({ preventScroll: true });
		else numeratorRef.current?.focus({ preventScroll: true });
	}, [showWhole]);

	const buildSubmission = (): FractionInputSubmission | null => {
		const w = whole.trim();
		const n = numerator.trim();
		const d = denominator.trim();
		switch (props.form) {
			case "whole":
				return w.length > 0 ? { form: "whole", whole: w } : null;
			case "proper":
				return n.length > 0 && d.length > 0
					? { form: "proper", numerator: n, denominator: d }
					: null;
			case "improper":
				return n.length > 0 && d.length > 0
					? { form: "improper", numerator: n, denominator: d }
					: null;
			case "mixed":
				return w.length > 0 && n.length > 0 && d.length > 0
					? { form: "mixed", whole: w, numerator: n, denominator: d }
					: null;
		}
	};

	const submission = buildSubmission();
	const canSubmit = submission !== null && !isPending;

	const handleSubmit = () => {
		if (submission) onSubmit(submission);
	};

	return (
		<Frame body={state.body} stimulus={state.stimulus} prompt={state.interaction.prompt}>
			<div className="flex flex-col gap-3">
				<div className="flex items-center gap-3">
					{showWhole ? (
						<NumericField
							inputRef={wholeRef}
							value={whole}
							onChange={setWhole}
							ariaLabel="Whole number"
							onEnter={() => (showFraction ? numeratorRef.current?.focus() : handleSubmit())}
							disabled={isPending}
						/>
					) : null}
					{showFraction ? (
						<div className="flex flex-col items-center">
							<NumericField
								inputRef={numeratorRef}
								value={numerator}
								onChange={setNumerator}
								ariaLabel="Numerator"
								onEnter={() => denominatorRef.current?.focus()}
								disabled={isPending}
							/>
							<span className="my-1 h-0.5 w-full min-w-14 rounded-full bg-foreground" />
							<NumericField
								inputRef={denominatorRef}
								value={denominator}
								onChange={setDenominator}
								ariaLabel="Denominator"
								onEnter={handleSubmit}
								disabled={isPending}
							/>
						</div>
					) : null}
				</div>

				{props.requireSimplified ? (
					<p className="text-xs text-muted-foreground">Answer must be in lowest terms.</p>
				) : null}
			</div>

			<div className="flex justify-end">
				<Button onClick={handleSubmit} disabled={!canSubmit}>
					{isPending ? "Submitting…" : "Submit"}
				</Button>
			</div>

			<FractionFormHint props={props} />
		</Frame>
	);
}

function NumericField({
	inputRef,
	value,
	onChange,
	onEnter,
	ariaLabel,
	disabled,
}: {
	inputRef: React.RefObject<HTMLInputElement | null>;
	value: string;
	onChange: (next: string) => void;
	onEnter: () => void;
	ariaLabel: string;
	disabled: boolean;
}) {
	return (
		<input
			ref={inputRef}
			type="text"
			inputMode="numeric"
			aria-label={ariaLabel}
			value={value}
			disabled={disabled}
			onChange={(e) => onChange(e.target.value)}
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					e.preventDefault();
					onEnter();
				}
			}}
			className={cn(
				"h-10 w-16 rounded-lg border border-input bg-background text-center text-base font-medium text-foreground outline-none transition-colors",
				"focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
				"disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
			)}
		/>
	);
}

function FractionFormHint({ props }: { props: FractionInputProps }) {
	const label =
		props.form === "whole"
			? "Whole number"
			: props.form === "proper"
				? "Proper fraction (numerator < denominator)"
				: props.form === "improper"
					? "Improper fraction (numerator ≥ denominator)"
					: "Mixed number";
	return (
		<p
			className="text-xs uppercase text-muted-foreground"
			style={{ letterSpacing: "var(--tracking-label)" }}
		>
			{label}
		</p>
	);
}
