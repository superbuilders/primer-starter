"use client";

import type { TextEntryState } from "@superbuilders/primer-tives/client";
import { useState } from "react";

import { Frame } from "../frame";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface TextEntryInteractionProps {
	state: TextEntryState;
	onSubmit: (value: string) => void;
	isPending: boolean;
}

export function TextEntryInteraction({ state, onSubmit, isPending }: TextEntryInteractionProps) {
	const [value, setValue] = useState("");
	const trimmed = value.trim();
	const canSubmit = trimmed.length > 0 && !isPending;

	return (
		<Frame body={state.body} stimulus={state.stimulus} prompt={state.interaction.prompt}>
			<form
				className="flex flex-col gap-3 sm:flex-row sm:items-center"
				onSubmit={(e) => {
					e.preventDefault();
					if (canSubmit) onSubmit(trimmed);
				}}
			>
				<Input
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder={state.interaction.placeholderText}
					maxLength={state.interaction.expectedLength}
					pattern={state.interaction.patternMask}
					disabled={isPending}
					autoFocus
					className="flex-1"
				/>
				<Button type="submit" disabled={!canSubmit}>
					{isPending ? "Submitting…" : "Submit"}
				</Button>
			</form>
		</Frame>
	);
}
