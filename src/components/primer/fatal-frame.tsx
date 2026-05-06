import type { FatalState } from "@superbuilders/primer-tives/client";

interface FatalFrameProps {
	state: FatalState;
}

export function FatalFrame({ state }: FatalFrameProps) {
	return (
		<section
			data-slot="primer-fatal"
			className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center"
		>
			<h2 className="text-xl font-semibold tracking-tight text-destructive">Session ended</h2>
			<p className="max-w-md text-sm text-muted-foreground">{state.error.message}</p>
			<p className="text-xs text-muted-foreground">Refresh the page to start a new session.</p>
		</section>
	);
}
