"use client";

import * as errors from "@superbuilders/errors";
import { create, type PrimerState } from "@superbuilders/primer-tives/client";
import type { FractionInputSubmission, MatchPair } from "@superbuilders/primer-tives/contracts";
import {
	ErrAuthCallbackInvalid,
	ErrAuthCancelled,
	ErrAuthConfigInvalid,
	ErrAuthPopupBlocked,
	ErrAuthStateMismatch,
	ErrAuthUnavailable,
	ErrMalformedAccessToken,
} from "@superbuilders/primer-tives/errors";
import * as logger from "@superbuilders/slog";
import { useCallback, useEffect, useRef, useState } from "react";

import { env } from "@/env";
import { CompletedFrame } from "./completed-frame";
import { ErroredFrame } from "./errored-frame";
import { FatalFrame } from "./fatal-frame";
import { FeedbackFrame } from "./feedback-frame";
import { ChoiceInteraction } from "./interactions/choice";
import { ExtendedTextMultipleInteraction } from "./interactions/extended-text-multiple";
import { ExtendedTextSingleInteraction } from "./interactions/extended-text-single";
import { MatchInteraction } from "./interactions/match";
import { OrderInteraction } from "./interactions/order";
import { FractionInputInteraction } from "./interactions/pci/fraction-input";
import { TextEntryInteraction } from "./interactions/text-entry";
import { ObservationFrame } from "./observation-frame";
import { Button } from "./ui/button";

type FractionPci = "urn:primer:pci:fraction-input";

type BootFailureKind =
	| "popup-blocked"
	| "cancelled"
	| "state-mismatch"
	| "callback-invalid"
	| "unavailable"
	| "config-invalid"
	| "malformed-token"
	| "unknown";

interface BootFailure {
	kind: BootFailureKind;
	headline: string;
	detail: string;
	retriable: boolean;
}

function classifyBootError(err: Error): BootFailure {
	if (errors.is(err, ErrAuthPopupBlocked)) {
		return {
			kind: "popup-blocked",
			headline: "Sign-in popup blocked",
			detail: "Allow popups for this site, then try again.",
			retriable: true,
		};
	}
	if (errors.is(err, ErrAuthCancelled)) {
		return {
			kind: "cancelled",
			headline: "Sign-in cancelled",
			detail: "The sign-in window closed before it finished.",
			retriable: true,
		};
	}
	if (errors.is(err, ErrAuthStateMismatch)) {
		return {
			kind: "state-mismatch",
			headline: "Sign-in didn't match",
			detail: "The sign-in result didn't match this attempt. Try again.",
			retriable: true,
		};
	}
	if (errors.is(err, ErrAuthCallbackInvalid)) {
		return {
			kind: "callback-invalid",
			headline: "Sign-in didn't complete",
			detail: "The sign-in callback wasn't accepted. Try again.",
			retriable: true,
		};
	}
	if (errors.is(err, ErrAuthUnavailable)) {
		return {
			kind: "unavailable",
			headline: "Sign-in unavailable",
			detail: "This browser doesn't support the features Primer's sign-in needs.",
			retriable: false,
		};
	}
	if (errors.is(err, ErrAuthConfigInvalid)) {
		return {
			kind: "config-invalid",
			headline: "Primer is misconfigured",
			detail: "The publishable key or origin is invalid for this deployment.",
			retriable: false,
		};
	}
	if (errors.is(err, ErrMalformedAccessToken)) {
		return {
			kind: "malformed-token",
			headline: "Invalid access token",
			detail: "The resolved access token isn't shaped like a learner token.",
			retriable: false,
		};
	}
	return {
		kind: "unknown",
		headline: "Could not start session",
		detail: err.message,
		retriable: true,
	};
}

export function PrimerSession() {
	const startedRef = useRef(false);
	const [state, setState] = useState<PrimerState<FractionPci> | null>(null);
	const [isPending, setIsPending] = useState(true);
	const [bootError, setBootError] = useState<BootFailure | null>(null);
	const [transitionError, setTransitionError] = useState<Error | null>(null);

	const boot = useCallback(async () => {
		setIsPending(true);
		setBootError(null);
		const result = await errors.try(
			create({
				origin: env.NEXT_PUBLIC_PRIMER_ORIGIN,
				publishableKey: env.NEXT_PUBLIC_PRIMER_PUBLISHABLE_KEY,
				subject: "math",
				supportedPcis: ["urn:primer:pci:fraction-input"],
				logger,
			}),
		);
		if (result.error) {
			const failure = classifyBootError(result.error);
			logger.error("primer create failed", { kind: failure.kind, error: result.error });
			setBootError(failure);
			setIsPending(false);
			return;
		}
		setState(result.data);
		setIsPending(false);
	}, []);

	useEffect(() => {
		if (startedRef.current) return;
		startedRef.current = true;
		void boot();
	}, [boot]);

	const run = useCallback(
		async (op: () => Promise<PrimerState<FractionPci>>) => {
			if (isPending) return;
			setIsPending(true);
			try {
				const next = await op();
				setState(next);
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				logger.error("primer transition rejected", { error });
				setTransitionError(error);
			} finally {
				setIsPending(false);
			}
		},
		[isPending],
	);

	const handleAdvance = useCallback(() => {
		if (state?.phase !== "observation" && state?.phase !== "feedback") return;
		run(() => state.advance());
	}, [state, run]);

	const handleRetry = useCallback(() => {
		if (state?.phase !== "errored") return;
		run(() => state.retry());
	}, [state, run]);

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key !== "Enter") return;
			if (e.metaKey || e.ctrlKey || e.altKey) return;
			const active = document.activeElement;
			if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return;
			if (active instanceof HTMLButtonElement) return;
			if (state?.phase === "observation" || state?.phase === "feedback") {
				e.preventDefault();
				handleAdvance();
			}
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [state, handleAdvance]);

	if (transitionError !== null) {
		return (
			<section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
				<h2 className="text-xl font-semibold tracking-tight text-destructive">
					Unexpected session error
				</h2>
				<p className="max-w-md text-sm text-muted-foreground">{transitionError.message}</p>
				<p className="text-xs text-muted-foreground">Refresh the page to start a new session.</p>
			</section>
		);
	}

	if (bootError !== null) {
		return (
			<section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
				<h2 className="text-xl font-semibold tracking-tight text-destructive">
					{bootError.headline}
				</h2>
				<p className="max-w-md text-sm text-muted-foreground">{bootError.detail}</p>
				{bootError.retriable ? (
					<Button onClick={() => void boot()} disabled={isPending}>
						{isPending ? "Retrying…" : "Retry"}
					</Button>
				) : null}
			</section>
		);
	}

	if (state === null) {
		return (
			<section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16">
				<span
					aria-hidden="true"
					className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground"
				/>
				<p className="text-sm text-muted-foreground">Starting session…</p>
			</section>
		);
	}

	switch (state.phase) {
		case "observation":
			return <ObservationFrame state={state} onContinue={handleAdvance} isPending={isPending} />;
		case "feedback":
			return <FeedbackFrame state={state} onContinue={handleAdvance} isPending={isPending} />;
		case "completed":
			return <CompletedFrame />;
		case "errored":
			return <ErroredFrame state={state} onRetry={handleRetry} isPending={isPending} />;
		case "fatal":
			return <FatalFrame state={state} />;
		case "interaction":
			switch (state.kind) {
				case "choice":
					return (
						<ChoiceInteraction
							state={state}
							onSubmit={(keys: string[]) => run(() => state.submitChoice(keys))}
							isPending={isPending}
						/>
					);
				case "text-entry":
					return (
						<TextEntryInteraction
							state={state}
							onSubmit={(value: string) => run(() => state.submitText(value))}
							isPending={isPending}
						/>
					);
				case "extended-text":
					if (state.cardinality === "single") {
						return (
							<ExtendedTextSingleInteraction
								state={state}
								onSubmit={(value: string) => run(() => state.submitText(value))}
								isPending={isPending}
							/>
						);
					}
					return (
						<ExtendedTextMultipleInteraction
							state={state}
							onSubmit={(values: string[]) => run(() => state.submitTexts(values))}
							isPending={isPending}
						/>
					);
				case "order":
					return (
						<OrderInteraction
							state={state}
							onSubmit={(keys: string[]) => run(() => state.submitOrder(keys))}
							isPending={isPending}
						/>
					);
				case "match":
					return (
						<MatchInteraction
							state={state}
							onSubmit={(pairs: MatchPair[]) => run(() => state.submitMatch(pairs))}
							isPending={isPending}
						/>
					);
				case "portable-custom":
					if (state.pciId === "urn:primer:pci:fraction-input") {
						return (
							<FractionInputInteraction
								state={state}
								onSubmit={(value: FractionInputSubmission) => run(() => state.submit(value))}
								isPending={isPending}
							/>
						);
					}
					return <UnknownPci pciId={state.pciId satisfies FractionPci} />;
			}
	}
}

function UnknownPci({ pciId }: { pciId: string }) {
	return (
		<section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 px-4 py-16 text-center">
			<h2 className="text-xl font-semibold text-destructive">Unsupported PCI</h2>
			<p className="text-sm text-muted-foreground">{pciId}</p>
		</section>
	);
}
