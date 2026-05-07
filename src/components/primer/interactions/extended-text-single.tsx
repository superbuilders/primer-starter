import type { ExtendedTextSingleState } from "@superbuilders/primer-tives/client";
import { useState } from "react";

import { Frame } from "../frame";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface ExtendedTextSingleInteractionProps {
	state: ExtendedTextSingleState;
	onSubmit: (value: string) => void;
	isPending: boolean;
}

export function ExtendedTextSingleInteraction({
	state,
	onSubmit,
	isPending,
}: ExtendedTextSingleInteractionProps) {
	const [value, setValue] = useState("");
	const trimmed = value.trim();
	const canSubmit = trimmed.length > 0 && !isPending;

	return (
		<Frame body={state.body} stimulus={state.stimulus} prompt={state.interaction.prompt}>
			<Textarea
				rows={state.interaction.expectedLines ?? 4}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder={state.interaction.placeholderText}
				maxLength={state.interaction.expectedLength}
				disabled={isPending}
				autoFocus
			/>
			<div className="flex justify-end">
				<Button onClick={() => onSubmit(trimmed)} disabled={!canSubmit}>
					{isPending ? "Submitting…" : "Submit"}
				</Button>
			</div>
		</Frame>
	);
}
