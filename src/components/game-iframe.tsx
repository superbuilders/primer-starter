import { type BridgeStatus, useGameBridge } from "@/lib/use-game-bridge";

const GAME_ENTRY_POINT = "/game/index.html";
const GAME_DEV_ENTRY_POINT = "http://localhost:5174/";

export function GameIframe() {
	const { iframeRef, status, error, onIframeLoad } = useGameBridge();
	const gameUrl = import.meta.env.DEV ? GAME_DEV_ENTRY_POINT : GAME_ENTRY_POINT;

	return (
		<section className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
				<h1 className="text-lg font-semibold tracking-tight">Embedded Primer Iframe</h1>
				<BridgeBadge status={status} />
			</div>
			{error ? (
				<div className="border-b border-destructive/20 bg-destructive/10 px-5 py-3 text-sm text-destructive">
					{error}
				</div>
			) : null}
			<iframe
				ref={iframeRef}
				src={gameUrl}
				onLoad={onIframeLoad}
				title="Primer game"
				className="min-h-0 flex-1 border-0 bg-background"
			/>
		</section>
	);
}

function BridgeBadge({ status }: { status: BridgeStatus }) {
	return (
		<span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium uppercase tracking-(--tracking-label) text-muted-foreground">
			{status}
		</span>
	);
}
