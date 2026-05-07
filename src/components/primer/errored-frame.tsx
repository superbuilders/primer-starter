import * as errors from "@superbuilders/errors";
import type { ErroredState } from "@superbuilders/primer-tives/client";
import {
	ErrConflict,
	ErrInvalidSubmission,
	ErrJsonParse,
	ErrNetwork,
	ErrRateLimited,
	ErrServerError,
	ErrServiceUnavailable,
	ErrTimeout,
} from "@superbuilders/primer-tives/errors";

import { Button } from "./ui/button";

interface ErroredFrameProps {
	state: ErroredState;
	onRetry: () => void;
	isPending: boolean;
}

interface ErrorMessage {
	headline: string;
	detail: string;
}

function describe(error: Error): ErrorMessage {
	if (errors.is(error, ErrInvalidSubmission)) {
		return {
			headline: "Invalid answer",
			detail: "That answer didn't fit this question. Try a different one.",
		};
	}
	if (errors.is(error, ErrNetwork)) {
		return {
			headline: "Connection lost",
			detail: "We couldn't reach Primer. Check your network and try again.",
		};
	}
	if (errors.is(error, ErrTimeout)) {
		return { headline: "Request timed out", detail: "The request took too long. Try again." };
	}
	if (errors.is(error, ErrRateLimited)) {
		return {
			headline: "Slow down",
			detail: "We're temporarily rate-limited. Try again in a moment.",
		};
	}
	if (errors.is(error, ErrServiceUnavailable)) {
		return {
			headline: "Primer is unavailable",
			detail: "Primer is temporarily unavailable. Try again shortly.",
		};
	}
	if (errors.is(error, ErrServerError)) {
		return {
			headline: "Primer hiccuped",
			detail: "Primer couldn't complete this step. Try again.",
		};
	}
	if (errors.is(error, ErrConflict)) {
		return {
			headline: "Action conflicted",
			detail: "Another action was already in flight. Try again.",
		};
	}
	if (errors.is(error, ErrJsonParse)) {
		return {
			headline: "Bad response",
			detail: "Primer's response couldn't be read. Try again.",
		};
	}
	return { headline: "Something went wrong", detail: error.message };
}

export function ErroredFrame({ state, onRetry, isPending }: ErroredFrameProps) {
	const { headline, detail } = describe(state.error);
	return (
		<section
			data-slot="primer-errored"
			className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center"
		>
			<h2 className="text-xl font-semibold tracking-tight text-destructive">{headline}</h2>
			<p className="max-w-md text-sm text-muted-foreground">{detail}</p>
			{state.retriable ? (
				<Button onClick={onRetry} disabled={isPending}>
					{isPending ? "Retrying…" : "Retry"}
				</Button>
			) : null}
		</section>
	);
}
