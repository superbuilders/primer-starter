import { useCallback, useEffect, useRef, useState } from "react";

import {
	BRIDGE_VERSION,
	gameBridgeMessageSchema,
	hostInitMessageSchema,
} from "../../shared/bridge";
import { primerEnvSchema } from "../../shared/primer";

const env = primerEnvSchema.parse(import.meta.env);

export type BridgeStatus = "loading" | "ready" | "started" | "complete" | "error";

export function useGameBridge() {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [status, setStatus] = useState<BridgeStatus>("loading");
	const [error, setError] = useState<string | null>(null);

	const sendHostInit = useCallback(() => {
		const targetWindow = iframeRef.current?.contentWindow;
		if (targetWindow === undefined || targetWindow === null) return;

		const message = hostInitMessageSchema.parse({
			type: "host:init",
			bridgeVersion: BRIDGE_VERSION,
			primerPublishableKey: env.VITE_PRIMER_PUBLISHABLE_KEY,
		});

		targetWindow.postMessage(message, window.location.origin);
	}, []);

	useEffect(() => {
		function onMessage(event: MessageEvent) {
			if (event.origin !== window.location.origin) return;
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
