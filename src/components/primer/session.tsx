"use client";

import { type Client, create, type PrimerState } from "@superbuilders/primer-tives/client";
import type { FractionInputSubmission, MatchPair } from "@superbuilders/primer-tives/contracts";
import * as logger from "@superbuilders/slog";
import { useCallback, useEffect, useRef, useState } from "react";

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

const SUPPORTED_PCIS = ["urn:primer:pci:fraction-input"] as const;
type SupportedPci = (typeof SUPPORTED_PCIS)[number];

interface PrimerSessionProps {
	accessToken: string;
	origin: string;
}

export function PrimerSession({ accessToken, origin }: PrimerSessionProps) {
	const clientRef = useRef<Client<SupportedPci> | null>(null);
	const startedRef = useRef(false);
	const [state, setState] = useState<PrimerState<SupportedPci> | null>(null);
	const [isPending, setIsPending] = useState(true);
	const [bootError, setBootError] = useState<Error | null>(null);

	if (clientRef.current === null) {
		clientRef.current = create({
			accessToken,
			origin,
			subject: "all",
			supportedPcis: SUPPORTED_PCIS,
			logger,
		});
	}

	useEffect(() => {
		if (startedRef.current) return;
		startedRef.current = true;
		const client = clientRef.current;
		if (!client) return;
		client
			.start()
			.then((next) => {
				setState(next);
				setIsPending(false);
			})
			.catch((err: unknown) => {
				const error = err instanceof Error ? err : new Error(String(err));
				logger.error("primer session start failed", { error });
				setBootError(error);
				setIsPending(false);
			});
	}, []);

	const run = useCallback(
		async (op: () => Promise<PrimerState<SupportedPci>>) => {
			if (isPending) return;
			setIsPending(true);
			try {
				const next = await op();
				setState(next);
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				logger.error("primer transition rejected", { error });
				setBootError(error);
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

	if (bootError !== null) {
		return (
			<section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
				<h2 className="text-xl font-semibold text-destructive">Could not start session</h2>
				<p className="max-w-md text-sm text-muted-foreground">{bootError.message}</p>
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
					return <UnknownPci pciId={state.pciId satisfies SupportedPci} />;
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
