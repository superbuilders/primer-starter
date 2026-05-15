import { BRIDGE_VERSION, type GameBridgeMessage, hostInitMessageSchema } from "@shared/bridge";
import { primerEnvSchema } from "@shared/primer";
import { useEffect, useState } from "react";

const IS_EMBEDDED = import.meta.env.VITE_IS_EMBEDDED === "true";
const HOST_DEV_ORIGIN = "http://localhost:5173";

export function useHostBridge() {
	const [publishableKey, setPublishableKey] = useState<string | null>(null);

	useEffect(() => {
		if (!IS_EMBEDDED) {
			const env = primerEnvSchema.parse(import.meta.env);
			setPublishableKey(env.VITE_PRIMER_PUBLISHABLE_KEY);
			return;
		}

		const hostOrigin = getHostOrigin();

		function onMessage(event: MessageEvent) {
			if (event.origin !== hostOrigin) return;
			if (event.source !== window.parent) return;
			const { success, data } = hostInitMessageSchema.safeParse(event.data);

			if (!success) return;

			setPublishableKey(data.primerPublishableKey);
		}

		window.addEventListener("message", onMessage);

		postGameMessage({ type: "game:ready", bridgeVersion: BRIDGE_VERSION });

		return () => window.removeEventListener("message", onMessage);
	}, []);

	return {
		publishableKey,
		onStarted: () => postGameMessage({ type: "game:started", bridgeVersion: BRIDGE_VERSION }),
		onComplete: () => postGameMessage({ type: "game:complete", bridgeVersion: BRIDGE_VERSION }),
		onError: (error: Error) => postGameMessage(gameError(error.message)),
	};
}

function postGameMessage(message: GameBridgeMessage) {
	if (!IS_EMBEDDED) return;
	window.parent.postMessage(message, getHostOrigin());
}

function getHostOrigin() {
	return import.meta.env.DEV ? HOST_DEV_ORIGIN : window.location.origin;
}

function gameError(error: string): GameBridgeMessage {
	return {
		type: "game:error",
		bridgeVersion: BRIDGE_VERSION,
		error,
	};
}
