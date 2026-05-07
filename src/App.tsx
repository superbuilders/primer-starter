import { PrimerSession } from "@/components/primer/session";

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
				<span className="text-lg font-semibold tracking-tight">Primer</span>
			</header>
			<main className="flex w-full flex-1 flex-col">
				<PrimerSession />
			</main>
		</div>
	);
}
