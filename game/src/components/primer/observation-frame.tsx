import type { ObservationState } from "@superbuilders/primer-tives/client";

import { Frame } from "./frame";
import { Button } from "./ui/button";

interface ObservationFrameProps {
	state: ObservationState;
	onContinue: () => void;
	isPending: boolean;
}

export function ObservationFrame({ state, onContinue, isPending }: ObservationFrameProps) {
	return (
		<Frame body={state.body} stimulus={state.stimulus}>
			<div className="flex justify-end">
				<Button onClick={onContinue} disabled={isPending}>
					{isPending ? "Loading…" : "Continue"}
				</Button>
			</div>
		</Frame>
	);
}
