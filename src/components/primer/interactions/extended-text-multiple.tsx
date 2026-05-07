import type { ExtendedTextMultipleState } from "@superbuilders/primer-tives/client";
import { useState } from "react";

import { Frame } from "../frame";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface ExtendedTextMultipleInteractionProps {
	state: ExtendedTextMultipleState;
	onSubmit: (values: string[]) => void;
	isPending: boolean;
}

export function ExtendedTextMultipleInteraction({
	state,
	onSubmit,
	isPending,
}: ExtendedTextMultipleInteractionProps) {
	const [values, setValues] = useState<string[]>(() => Array(state.minStrings).fill(""));
	const nonEmptyCount = values.filter((v) => v.trim().length > 0).length;
	const canAdd = values.length < state.maxStrings && !isPending;
	const canSubmit = nonEmptyCount >= state.minStrings && !isPending;

	const setAt = (i: number, v: string) =>
		setValues((prev) => {
			const next = prev.slice();
			next[i] = v;
			return next;
		});

	const removeAt = (i: number) => {
		if (values.length <= state.minStrings) return;
		setValues((prev) => prev.filter((_, idx) => idx !== i));
	};

	const handleSubmit = () => {
		onSubmit(values.map((v) => v.trim()).filter((v) => v.length > 0));
	};

	return (
		<Frame body={state.body} stimulus={state.stimulus} prompt={state.interaction.prompt}>
			<div className="flex flex-col gap-3">
				{values.map((value, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: rows are positional and editable in place
						key={i}
						className="flex items-start gap-2"
					>
						<Textarea
							rows={state.interaction.expectedLines ?? 2}
							value={value}
							onChange={(e) => setAt(i, e.target.value)}
							placeholder={state.interaction.placeholderText ?? `Entry ${i + 1}`}
							maxLength={state.interaction.expectedLength}
							disabled={isPending}
							className="flex-1"
						/>
						{values.length > state.minStrings ? (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => removeAt(i)}
								disabled={isPending}
								className="h-9"
								aria-label={`Remove entry ${i + 1}`}
							>
								Remove
							</Button>
						) : null}
					</div>
				))}
			</div>
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => canAdd && setValues((prev) => [...prev, ""])}
						disabled={!canAdd}
					>
						+ Add entry
					</Button>
					<p className="text-xs text-muted-foreground">
						{state.minStrings === state.maxStrings
							? `${state.minStrings} required`
							: `${state.minStrings}–${state.maxStrings} required`}
					</p>
				</div>
				<Button onClick={handleSubmit} disabled={!canSubmit}>
					{isPending ? "Submitting…" : "Submit"}
				</Button>
			</div>
		</Frame>
	);
}
