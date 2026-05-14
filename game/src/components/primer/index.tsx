import * as errors from "@superbuilders/errors";
import {
	type FeedbackState,
	type PrimerOptions,
	type PrimerState,
	start,
	type UnauthenticatedState,
} from "@superbuilders/primer-tives/client";
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
import pino from "pino";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

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
import { QuestionTimer } from "./question-timer";
import { Button } from "./ui/button";

const logger = pino({ level: "info" });

type FractionPci = "urn:primer:pci:fraction-input";

const PRIMER_ORIGIN = "https://primerlearn.dev";

export type PrimerPhase = PrimerState<FractionPci>["phase"];

export interface PrimerProps {
	onCorrect?: (state: FeedbackState) => void;
	onIncorrect?: (state: FeedbackState) => void;
	onComplete?: () => void;
	onError?: (error: Error) => void;
	onPhaseChange?: (phase: PrimerPhase) => void;
	onAuthenticated?: () => void;
}

type SessionFailureKind =
	| "auth-required"
	| "popup-blocked"
	| "cancelled"
	| "state-mismatch"
	| "callback-invalid"
	| "unavailable"
	| "config-invalid"
	| "malformed-token"
	| "unknown";

interface SessionFailure {
	kind: SessionFailureKind;
	headline: string;
	detail: ReactNode;
	retriable: boolean;
}

const primerOptions = {
	origin: PRIMER_ORIGIN,
	publishableKey: env.VITE_PRIMER_PUBLISHABLE_KEY,
	subject: "math",
	supportedPcis: ["urn:primer:pci:fraction-input"],
	logger,
} satisfies PrimerOptions<"math", readonly [FractionPci]>;

function classifyAuthState(error: Error | null): SessionFailure {
	if (error === null) {
		return {
			kind: "auth-required",
			headline: "Sign in to Primer",
			detail: "Continue with Primer to start your learning session.",
			retriable: true,
		};
	}
	if (errors.is(error, ErrAuthPopupBlocked)) {
		return {
			kind: "popup-blocked",
			headline: "Sign-in popup blocked",
			detail: "Allow popups for this site, then try again.",
			retriable: true,
		};
	}
	if (errors.is(error, ErrAuthCancelled)) {
		return {
			kind: "cancelled",
			headline: "Sign-in cancelled",
			detail: "The sign-in window closed before it finished.",
			retriable: true,
		};
	}
	if (errors.is(error, ErrAuthStateMismatch)) {
		return {
			kind: "state-mismatch",
			headline: "Sign-in didn't match",
			detail: "The sign-in result didn't match this attempt. Try again.",
			retriable: true,
		};
	}
	if (errors.is(error, ErrAuthCallbackInvalid)) {
		return {
			kind: "callback-invalid",
			headline: "Sign-in didn't complete",
			detail: "The sign-in callback wasn't accepted. Try again.",
			retriable: true,
		};
	}
	if (errors.is(error, ErrAuthUnavailable)) {
		return {
			kind: "unavailable",
			headline: "Sign-in unavailable",
			detail: "This browser doesn't support the features Primer's sign-in needs.",
			retriable: false,
		};
	}
	if (errors.is(error, ErrAuthConfigInvalid)) {
		return {
			kind: "config-invalid",
			headline: "Invalid Publishable Key",
			detail: (
				<>
					It looks like the key in your .env file isn't quite right. Go to{" "}
					<a
						href="https://primerlearn.dev/keys"
						target="_blank"
						rel="noopener noreferrer"
						className="underline hover:text-foreground"
					>
						https://primerlearn.dev/keys
					</a>{" "}
					to double-check it.
				</>
			),
			retriable: false,
		};
	}
	if (errors.is(error, ErrMalformedAccessToken)) {
		return {
			kind: "malformed-token",
			headline: "Sign-in token invalid",
			detail: "Sign in with Primer again to continue.",
			retriable: true,
		};
	}
	return {
		kind: "unknown",
		headline: "Sign-in failed",
		detail: error.message,
		retriable: true,
	};
}

function classifyBootError(err: Error): SessionFailure {
	const authFailure = classifyAuthState(err);
	if (authFailure.kind !== "unknown") {
		return authFailure;
	}
	return {
		kind: "unknown",
		headline: "Could not start session",
		detail: err.message,
		retriable: true,
	};
}

export function Primer(props: PrimerProps) {
	const startedRef = useRef(false);
	const [state, setState] = useState<PrimerState<FractionPci> | null>(null);
	const [isPending, setIsPending] = useState(true);
	const [bootError, setBootError] = useState<SessionFailure | null>(null);
	const [transitionError, setTransitionError] = useState<Error | null>(null);

	const [timerKey, setTimerKey] = useState(0);
	const [activeInteractionState, setActiveInteractionState] =
		useState<PrimerState<FractionPci> | null>(null);

	const callbacksRef = useRef(props);
	useEffect(() => {
		callbacksRef.current = props;
	});

	const reportError = useCallback((error: Error) => {
		callbacksRef.current.onError?.(error);
	}, []);

	const boot = useCallback(async () => {
		setIsPending(true);
		setBootError(null);

		// Fail fast if they didn't replace the template key!
		if (env.VITE_PRIMER_PUBLISHABLE_KEY === "pk_replace_me") {
			setBootError({
				kind: "config-invalid",
				headline: "You need to set up your key!",
				detail: (
					<>
						Go to{" "}
						<a
							href="https://primerlearn.dev/keys"
							target="_blank"
							rel="noopener noreferrer"
							className="underline hover:text-foreground"
						>
							https://primerlearn.dev/keys
						</a>{" "}
						to get your Publishable Key, and paste it into your .env file.
					</>
				),
				retriable: false,
			});
			setIsPending(false);
			return;
		}

		const result = await errors.try(start(primerOptions));
		if (result.error) {
			const failure = classifyBootError(result.error);
			logger.error({ kind: failure.kind, error: result.error }, "primer start failed");
			setBootError(failure);
			setIsPending(false);
			reportError(result.error);
			return;
		}
		setState(result.data);
		setIsPending(false);
	}, [reportError]);

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
				logger.error({ error }, "primer transition rejected");
				setTransitionError(error);
				reportError(error);
			} finally {
				setIsPending(false);
			}
		},
		[isPending, reportError],
	);

	const handleAdvance = useCallback(() => {
		if (state?.phase !== "observation" && state?.phase !== "feedback") return;
		run(() => state.advance());
	}, [state, run]);

	const handleRetry = useCallback(() => {
		if (state?.phase !== "errored") return;
		run(() => state.retry());
	}, [state, run]);

	const handleLogin = useCallback(() => {
		if (state?.phase !== "unauthenticated" || isPending) return;
		const nextState = state.login();
		setIsPending(true);
		nextState
			.then((next) => setState(next))
			.catch((err: unknown) => {
				const error = err instanceof Error ? err : new Error(String(err));
				logger.error({ error }, "primer login rejected");
				setTransitionError(error);
				reportError(error);
			})
			.finally(() => setIsPending(false));
	}, [state, isPending, reportError]);

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

	const prevPhaseRef = useRef<PrimerPhase | null>(null);
	useEffect(() => {
		if (state === null) return;

		if (state.phase === "interaction" && state !== activeInteractionState) {
			setActiveInteractionState(state);
			setTimerKey((k) => k + 1);
		} else if (state.phase !== "interaction" && activeInteractionState !== null) {
			setActiveInteractionState(null);
		}

		const prevPhase = prevPhaseRef.current;
		if (prevPhase === state.phase) return;
		prevPhaseRef.current = state.phase;

		const cb = callbacksRef.current;
		cb.onPhaseChange?.(state.phase);

		if (prevPhase === "unauthenticated" && state.phase !== "unauthenticated") {
			cb.onAuthenticated?.();
		}

		if (state.phase === "feedback") {
			if (state.isCorrect) cb.onCorrect?.(state);
			else cb.onIncorrect?.(state);
		} else if (state.phase === "completed") {
			cb.onComplete?.();
		} else if (state.phase === "errored" || state.phase === "fatal") {
			cb.onError?.(state.error);
		}
	}, [state, activeInteractionState]);

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
		case "unauthenticated":
			return <UnauthenticatedFrame state={state} onLogin={handleLogin} isPending={isPending} />;
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
		case "interaction": {
			const timerNode = (
				<QuestionTimer
					key={timerKey}
					durationMs={30000}
					isPending={isPending}
					onExpire={() => run(() => state.timeout())}
				/>
			);

			switch (state.kind) {
				case "choice":
					return (
						<ChoiceInteraction
							state={state}
							onSubmit={(keys: string[]) => run(() => state.submitChoice(keys))}
							isPending={isPending}
							timer={timerNode}
						/>
					);
				case "text-entry":
					return (
						<TextEntryInteraction
							state={state}
							onSubmit={(value: string) => run(() => state.submitText(value))}
							isPending={isPending}
							timer={timerNode}
						/>
					);
				case "extended-text":
					if (state.cardinality === "single") {
						return (
							<ExtendedTextSingleInteraction
								state={state}
								onSubmit={(value: string) => run(() => state.submitText(value))}
								isPending={isPending}
								timer={timerNode}
							/>
						);
					}
					return (
						<ExtendedTextMultipleInteraction
							state={state}
							onSubmit={(values: string[]) => run(() => state.submitTexts(values))}
							isPending={isPending}
							timer={timerNode}
						/>
					);
				case "order":
					return (
						<OrderInteraction
							state={state}
							onSubmit={(keys: string[]) => run(() => state.submitOrder(keys))}
							isPending={isPending}
							timer={timerNode}
						/>
					);
				case "match":
					return (
						<MatchInteraction
							state={state}
							onSubmit={(pairs: MatchPair[]) => run(() => state.submitMatch(pairs))}
							isPending={isPending}
							timer={timerNode}
						/>
					);
				case "portable-custom":
					if (state.pciId === "urn:primer:pci:fraction-input") {
						return (
							<FractionInputInteraction
								state={state}
								onSubmit={(value: FractionInputSubmission) => run(() => state.submit(value))}
								isPending={isPending}
								timer={timerNode}
							/>
						);
					}
					return <UnknownPci pciId={state.pciId satisfies FractionPci} />;
			}
		}
	}
}

function UnauthenticatedFrame({
	state,
	onLogin,
	isPending,
}: {
	state: UnauthenticatedState<FractionPci>;
	onLogin: () => void;
	isPending: boolean;
}) {
	const failure = classifyAuthState(state.error);
	return (
		<section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
			<h2 className="text-xl font-semibold tracking-tight">{failure.headline}</h2>
			<p className="max-w-md text-sm text-muted-foreground">{failure.detail}</p>
			{failure.retriable ? (
				<Button onClick={onLogin} disabled={isPending}>
					{isPending ? "Signing in…" : "Continue with Primer"}
				</Button>
			) : null}
		</section>
	);
}

function UnknownPci({ pciId }: { pciId: string }) {
	return (
		<section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 px-4 py-16 text-center">
			<h2 className="text-xl font-semibold text-destructive">Unsupported PCI</h2>
			<p className="text-sm text-muted-foreground">{pciId}</p>
		</section>
	);
}
