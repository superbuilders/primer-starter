import type { FeedbackState } from "@superbuilders/primer-tives/client";

import { Inline } from "./content";
import { Frame } from "./frame";
import { ReviewView } from "./review-view";
import { SubmissionView } from "./submission-view";
import { Button } from "./ui/button";
import { cn } from "./ui/cn";

interface FeedbackFrameProps {
	state: FeedbackState;
	onContinue: () => void;
	isPending: boolean;
}

export function FeedbackFrame({ state, onContinue, isPending }: FeedbackFrameProps) {
	return (
		<Frame body={state.body} stimulus={state.stimulus} prompt={state.interaction.prompt}>
			<SubmissionView interaction={state.interaction} submission={state.submission} />

			<output
				aria-live="polite"
				className={cn(
					"flex flex-col gap-2 rounded-xl border px-5 py-4 animate-soft-fade-in",
					state.isCorrect
						? "border-success/40 bg-success/10"
						: "border-destructive/40 bg-destructive/10",
				)}
			>
				<span
					className={cn(
						"text-xs font-medium uppercase",
						state.isCorrect ? "text-success" : "text-destructive",
					)}
					style={{ letterSpacing: "var(--tracking-label)" }}
				>
					{state.isCorrect ? "Correct" : "Not quite"}
				</span>
				{state.feedbackContent.length > 0 ? (
					<p className="text-sm leading-relaxed text-foreground">
						<Inline nodes={state.feedbackContent} />
					</p>
				) : null}
			</output>

			{state.review ? <ReviewView interaction={state.interaction} review={state.review} /> : null}

			<div className="flex justify-end">
				<Button onClick={onContinue} disabled={isPending}>
					{isPending ? "Loading…" : "Continue"}
				</Button>
			</div>
		</Frame>
	);
}
