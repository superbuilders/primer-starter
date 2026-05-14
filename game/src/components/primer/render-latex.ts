import temml from "temml";

export function renderLatexToHtml(latex: string): string {
	return temml.renderToString(latex, { displayMode: false });
}
