import { GameIframe } from "./game-iframe";

export function GamePage() {
	return (
		<main className="flex flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
			<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
				<GameIframe />
			</div>
		</main>
	);
}
