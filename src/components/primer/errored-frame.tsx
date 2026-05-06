import type { ErroredState } from "@superbuilders/primer-tives/client";

import { Button } from "./ui/button";

interface ErroredFrameProps {
	state: ErroredState;
	onRetry: () => void;
	isPending: boolean;
}

export function ErroredFrame({ state, onRetry, isPending }: ErroredFrameProps) {
	return (
		<section
			data-slot="primer-errored"
			className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center"
		>
			<h2 className="text-xl font-semibold tracking-tight text-destructive">
				Something went wrong
			</h2>
			<p className="max-w-md text-sm text-muted-foreground">{state.error.message}</p>
			{state.retriable ? (
				<Button onClick={onRetry} disabled={isPending}>
					{isPending ? "Retrying…" : "Retry"}
				</Button>
			) : null}
		</section>
	);
}
