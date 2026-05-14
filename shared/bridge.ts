import { z } from "zod";

import { publishableKeySchema } from "./primer";

export const BRIDGE_VERSION = 1;

const bridgeVersionSchema = z.literal(BRIDGE_VERSION);

const bridgeMessageSchema = z.object({
	bridgeVersion: bridgeVersionSchema,
});

export const hostInitMessageSchema = bridgeMessageSchema.extend({
	type: z.literal("host:init"),
	primerPublishableKey: publishableKeySchema,
});

const gameErrorMessageSchema = bridgeMessageSchema.extend({
	type: z.literal("game:error"),
	error: z.string(),
});

const gameReadyMessageSchema = bridgeMessageSchema.extend({
	type: z.literal("game:ready"),
});

const gameStartedMessageSchema = bridgeMessageSchema.extend({
	type: z.literal("game:started"),
});

const gameCompleteMessageSchema = bridgeMessageSchema.extend({
	type: z.literal("game:complete"),
});

export const gameBridgeMessageSchema = z.discriminatedUnion("type", [
	gameReadyMessageSchema,
	gameStartedMessageSchema,
	gameErrorMessageSchema,
	gameCompleteMessageSchema,
]);
export type GameBridgeMessage = z.infer<typeof gameBridgeMessageSchema>;
