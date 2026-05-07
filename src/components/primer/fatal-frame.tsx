import * as errors from "@superbuilders/errors";
import type { FatalState } from "@superbuilders/primer-tives/client";
import {
	ErrBadRequest,
	ErrForbidden,
	ErrInvalidAccessToken,
	ErrNotFound,
	ErrSdkUpgradeRequired,
	ErrTokenExpired,
	ErrUnsupportedPci,
} from "@superbuilders/primer-tives/errors";

interface FatalFrameProps {
	state: FatalState;
}

interface ErrorMessage {
	headline: string;
	detail: string;
	hint: string;
}

function describe(error: Error): ErrorMessage {
	if (errors.is(error, ErrTokenExpired)) {
		return {
			headline: "Session expired",
			detail: "Your sign-in expired.",
			hint: "Refresh the page to sign in again.",
		};
	}
	if (errors.is(error, ErrInvalidAccessToken)) {
		return {
			headline: "Sign-in rejected",
			detail: "Primer rejected the access token.",
			hint: "Refresh the page to sign in again.",
		};
	}
	if (errors.is(error, ErrForbidden)) {
		return {
			headline: "Access denied",
			detail: "You aren't allowed to continue in this scope.",
			hint: "Contact the team that gave you access.",
		};
	}
	if (errors.is(error, ErrNotFound)) {
		return {
			headline: "Not found",
			detail: "Primer couldn't find a runtime scope for this session.",
			hint: "Refresh the page to start a new session.",
		};
	}
	if (errors.is(error, ErrSdkUpgradeRequired)) {
		return {
			headline: "App update required",
			detail: "This app uses an outdated Primer SDK.",
			hint: "Reload to pick up the latest build.",
		};
	}
	if (errors.is(error, ErrUnsupportedPci)) {
		return {
			headline: "Unsupported question type",
			detail: "Primer presented an interaction this renderer can't handle.",
			hint: "Refresh the page to start a new session.",
		};
	}
	if (errors.is(error, ErrBadRequest)) {
		return {
			headline: "Request rejected",
			detail: "Primer rejected the request as invalid.",
			hint: "Refresh the page to start a new session.",
		};
	}
	return {
		headline: "Session ended",
		detail: error.message,
		hint: "Refresh the page to start a new session.",
	};
}

export function FatalFrame({ state }: FatalFrameProps) {
	const { headline, detail, hint } = describe(state.error);
	return (
		<section
			data-slot="primer-fatal"
			className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center"
		>
			<h2 className="text-xl font-semibold tracking-tight text-destructive">{headline}</h2>
			<p className="max-w-md text-sm text-muted-foreground">{detail}</p>
			<p className="text-xs text-muted-foreground">{hint}</p>
		</section>
	);
}
