import { Primer } from "@/components/primer";

export function App() {
	return (
		<div className="flex min-h-screen flex-col bg-background text-foreground">
			<header className="flex items-center gap-3 border-b border-border px-6 py-4">
				<div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-sm font-semibold text-background">
					P
				</div>
				<span className="text-lg font-semibold tracking-tight">Primer</span>
			</header>
			<main className="flex w-full flex-1 flex-col">
				<Primer />
			</main>
		</div>
	);
}
