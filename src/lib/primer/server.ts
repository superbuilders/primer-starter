import "server-only";

import { createPrimerServer, type PrimerServer } from "@superbuilders/primer-tives/server";
import * as logger from "@superbuilders/slog";

import { env } from "@/env";

export const primer: PrimerServer = createPrimerServer({
	origin: env.PRIMER_ORIGIN,
	secretKey: env.PRIMER_SECRET_KEY,
	logger,
});
