export function HomePage() {
	return (
		<main className="flex flex-1 items-center justify-center px-6 py-16">
			<section className="w-full max-w-lg flex flex-col gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
				<h1 className="text-3xl mb-3 font-semibold tracking-tight">Primer Host App</h1>
				<p className="text-sm leading-6 text-muted-foreground">
					The Primer learning experience runs in an embedded iframe. The host provides config at
					runtime over a small typed bridge.
				</p>
				<a
					href="/game"
					className="w-max mt-6 inline-flex rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
				>
					Open game
				</a>
			</section>
		</main>
	);
}
