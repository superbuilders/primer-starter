import { BRIDGE_VERSION, gameBridgeMessageSchema, hostInitMessageSchema } from "@shared/bridge";
import { primerEnvSchema } from "@shared/primer";
import { useCallback, useEffect, useRef, useState } from "react";

const { VITE_PRIMER_PUBLISHABLE_KEY } = primerEnvSchema.parse(import.meta.env);
const GAME_DEV_ORIGIN = "http://localhost:5174";

export type BridgeStatus = "loading" | "ready" | "started" | "complete" | "error";

export function useGameBridge() {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [status, setStatus] = useState<BridgeStatus>("loading");
	const [error, setError] = useState<string | null>(null);

	const sendHostInit = useCallback(() => {
		const targetWindow = iframeRef.current?.contentWindow;
		if (targetWindow === undefined || targetWindow === null) return;
		const gameOrigin = getGameOrigin();

		const message = hostInitMessageSchema.parse({
			type: "host:init",
			bridgeVersion: BRIDGE_VERSION,
			primerPublishableKey: VITE_PRIMER_PUBLISHABLE_KEY,
		});

		targetWindow.postMessage(message, gameOrigin);
	}, []);

	useEffect(() => {
		const gameOrigin = getGameOrigin();

		function onMessage(event: MessageEvent) {
			if (event.origin !== gameOrigin) return;
			if (event.source !== iframeRef.current?.contentWindow) return;
			const parsed = gameBridgeMessageSchema.safeParse(event.data);

			if (!parsed.success) return;

			switch (parsed.data.type) {
				case "game:ready":
					setStatus("ready");
					setError(null);
					sendHostInit();
					break;
				case "game:started":
					setStatus("started");
					setError(null);
					break;
				case "game:complete":
					setStatus("complete");
					break;
				case "game:error":
					setStatus("error");
					setError(parsed.data.error);
					break;
			}
		}

		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, [sendHostInit]);

	return { iframeRef, status, error, onIframeLoad: sendHostInit };
}

function getGameOrigin() {
	return import.meta.env.DEV ? GAME_DEV_ORIGIN : window.location.origin;
}
