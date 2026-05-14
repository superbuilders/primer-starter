import { useEffect, useState } from "react";

import {
	BRIDGE_VERSION,
	type GameBridgeMessage,
	hostInitMessageSchema,
} from "../../../shared/bridge";
import { primerEnvSchema } from "../../../shared/primer";

export function useHostBridge() {
	const [publishableKey, setPublishableKey] = useState<string | null>(null);

	useEffect(() => {
		if (window.parent === window) {
			const env = primerEnvSchema.parse(import.meta.env);
			setPublishableKey(env.VITE_PRIMER_PUBLISHABLE_KEY);
			return;
		}

		function onMessage(event: MessageEvent) {
			if (event.origin !== window.location.origin) return;
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
	if (window.parent === window) return;
	window.parent.postMessage(message, window.location.origin);
}

function gameError(error: string): GameBridgeMessage {
	return {
		type: "game:error",
		bridgeVersion: BRIDGE_VERSION,
		error,
	};
}
