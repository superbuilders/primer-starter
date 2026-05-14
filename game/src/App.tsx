import { Primer } from "@/components/primer";
import { useHostBridge } from "@/lib/use-host-bridge";

export function App() {
	const { publishableKey, onStarted, onComplete, onError } = useHostBridge();

	return (
		<div className="flex min-h-screen flex-col bg-background text-foreground">
			<main className="flex w-full flex-1 flex-col">
				{publishableKey === null ? <WaitingForConfig /> : null}
				{publishableKey !== null ? (
					<Primer
						publishableKey={publishableKey}
						onStarted={onStarted}
						onComplete={onComplete}
						onError={onError}
					/>
				) : null}
			</main>
		</div>
	);
}

function WaitingForConfig() {
	return (
		<section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16">
			<span
				aria-hidden="true"
				className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground"
			/>
			<p className="text-sm text-muted-foreground">Waiting for host config…</p>
		</section>
	);
}
