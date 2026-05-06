import "server-only";

import * as errors from "@superbuilders/errors";
import {
	ErrBadRequest,
	ErrInvalidSecretKey,
	ErrJsonParse,
	ErrNetwork,
	ErrServerError,
	ErrTimeout,
} from "@superbuilders/primer-tives/errors";
import * as logger from "@superbuilders/slog";

import { env } from "@/env";
import { primer } from "@/lib/primer/server";

export async function getPrimerAccessToken(): Promise<string> {
	const result = await errors.try(primer.getToken({ verifiedEmail: env.PRIMER_TEST_EMAIL }));
	if (result.error) {
		if (errors.is(result.error, ErrInvalidSecretKey)) {
			logger.error("primer secret key invalid", { error: result.error });
			throw errors.wrap(result.error, "primer token");
		}
		if (errors.is(result.error, ErrBadRequest)) {
			logger.error("primer token request rejected", { error: result.error });
			throw errors.wrap(result.error, "primer token");
		}
		if (errors.is(result.error, ErrNetwork) || errors.is(result.error, ErrTimeout)) {
			logger.error("primer token transport failed", { error: result.error });
			throw errors.wrap(result.error, "primer token");
		}
		if (errors.is(result.error, ErrServerError) || errors.is(result.error, ErrJsonParse)) {
			logger.error("primer token upstream failure", { error: result.error });
			throw errors.wrap(result.error, "primer token");
		}
		logger.error("primer token failed", { error: result.error });
		throw errors.wrap(result.error, "primer token");
	}
	return result.data;
}
