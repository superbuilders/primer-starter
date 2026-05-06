import temml from "temml";

interface LatexProps {
	value: string;
	display?: boolean;
}

export function Latex({ value, display = false }: LatexProps) {
	const html = temml.renderToString(value, { displayMode: display, throwOnError: false });
	return (
		<span
			data-slot="latex"
			className="primer-latex"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: temml output is sanitized MathML
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
