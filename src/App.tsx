export function App() {
	return (
		<div className="flex min-h-screen flex-col bg-background text-foreground">
			<header className="flex items-center gap-3 border-b border-border px-6 py-4">
				<img
					src="/primer-blackbg-icon.png"
					alt="Primer"
					width={32}
					height={32}
					className="rounded-md"
				/>
				<span className="text-lg font-semibold tracking-tight">Primer Starter</span>
			</header>
			<main className="flex flex-1 items-center justify-center px-6 py-16">
				<section className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 shadow-sm">
					<p className="text-sm font-medium uppercase tracking-(--tracking-label) text-muted-foreground">
						Host app
					</p>
					<h1 className="mt-3 text-3xl font-semibold tracking-tight">
						Primer game split in progress
					</h1>
					<p className="mt-4 text-sm leading-6 text-muted-foreground">
						The Primer learning experience now lives in the embedded game app. The iframe host
						bridge will be added in the next phase.
					</p>
				</section>
			</main>
		</div>
	);
}
