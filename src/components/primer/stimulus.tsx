import { inlinesToPlainText, type RendererStimulus } from "@superbuilders/primer-tives/contracts";

interface StimulusProps {
	stimulus: RendererStimulus | null;
}

export function Stimulus({ stimulus }: StimulusProps) {
	if (stimulus === null) return null;
	switch (stimulus.kind) {
		case "image":
			return (
				<div className="flex justify-center">
					<div className="aspect-video w-full max-w-md overflow-hidden rounded-xl border border-border bg-muted/30">
						<img
							src={stimulus.src}
							alt={inlinesToPlainText(stimulus.alt)}
							className="h-full w-full object-contain"
						/>
					</div>
				</div>
			);
	}
}
