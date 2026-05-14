export function CompletedFrame() {
	return (
		<section
			data-slot="primer-completed"
			className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 px-4 py-20 text-center"
		>
			<div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-2xl text-success">
				✓
			</div>
			<h2 className="text-xl font-semibold tracking-tight text-foreground">Lesson complete</h2>
			<p className="max-w-sm text-sm text-muted-foreground">
				You&rsquo;ve reached the end of this run. Refresh the page to start a new session.
			</p>
		</section>
	);
}
