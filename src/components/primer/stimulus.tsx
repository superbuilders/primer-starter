import { inlinesToPlainText, type RendererStimulus } from "@superbuilders/primer-tives/contracts";
import Image from "next/image";

interface StimulusProps {
	stimulus: RendererStimulus | null;
}

export function Stimulus({ stimulus }: StimulusProps) {
	if (stimulus === null) return null;
	switch (stimulus.kind) {
		case "image":
			return (
				<div className="flex justify-center">
					<div className="relative aspect-video w-full max-w-md overflow-hidden rounded-xl border border-border bg-muted/30">
						<Image
							src={stimulus.src}
							alt={inlinesToPlainText(stimulus.alt)}
							fill
							sizes="(min-width: 448px) 448px, 100vw"
							className="object-contain"
							unoptimized
						/>
					</div>
				</div>
			);
	}
}
