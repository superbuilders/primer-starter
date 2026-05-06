import type {
	ContentBlock,
	ContentInline,
	RendererStimulus,
} from "@superbuilders/primer-tives/contracts";
import type { ReactNode } from "react";

import { Blocks, Inline } from "./content";
import { Stimulus } from "./stimulus";
import { cn } from "./ui/cn";

interface FrameProps {
	body: ContentBlock[];
	stimulus: RendererStimulus | null;
	prompt?: ContentInline[];
	children?: ReactNode;
	className?: string;
}

export function Frame({ body, stimulus, prompt, children, className }: FrameProps) {
	return (
		<section
			data-slot="primer-frame"
			className={cn("mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:py-14", className)}
		>
			<Blocks blocks={body} />
			<Stimulus stimulus={stimulus} />
			{prompt && prompt.length > 0 ? (
				<p
					id="primer-prompt"
					className="text-balance text-lg font-medium leading-snug text-foreground"
				>
					<Inline nodes={prompt} />
				</p>
			) : null}
			{children}
		</section>
	);
}
