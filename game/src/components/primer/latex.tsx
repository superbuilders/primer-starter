import { renderLatexToHtml } from "./render-latex";

interface LatexProps {
	value: string;
}

export function Latex({ value }: LatexProps) {
	const html = renderLatexToHtml(value);
	return (
		<span
			data-slot="latex"
			className="primer-latex"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: temml output is sanitized MathML
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
