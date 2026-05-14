import { GamePage } from "@/components/game-page";
import { HomePage } from "@/components/home-page";

export function App() {
	const page = window.location.pathname === "/game" ? <GamePage /> : <HomePage />;

	return (
		<div className="flex min-h-screen flex-col bg-background text-foreground">
			<header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
				<a href="/" className="flex items-center gap-3">
					<img
						src="/primer-blackbg-icon.png"
						alt="Primer"
						width={32}
						height={32}
						className="rounded-md"
					/>
					<span className="text-lg font-semibold tracking-tight">Primer Starter</span>
				</a>
				<nav className="flex items-center gap-4 text-sm text-muted-foreground">
					<a href="/" className="transition hover:text-foreground">
						Home
					</a>
					<a href="/game" className="transition hover:text-foreground">
						Game
					</a>
				</nav>
			</header>
			{page}
		</div>
	);
}
