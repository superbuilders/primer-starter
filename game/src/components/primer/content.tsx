import type { ContentBlock, ContentInline } from "@superbuilders/primer-tives/contracts";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Latex } from "./latex";

export function renderInline(node: ContentInline, key: number): ReactNode {
	switch (node.type) {
		case "text":
			return <span key={key}>{node.value}</span>;
		case "italic":
			return <em key={key}>{node.value}</em>;
		case "latex":
			return <Latex key={key} value={node.value} />;
	}
}

interface InlineProps {
	nodes: ContentInline[];
	className?: string;
}

export function Inline({ nodes, className }: InlineProps) {
	return <span className={className}>{nodes.map(renderInline)}</span>;
}

function renderBlock(node: ContentBlock, key: number): ReactNode {
	switch (node.type) {
		case "paragraph":
			return (
				<p key={key} className="text-pretty text-base leading-relaxed text-foreground last:mb-0">
					{node.children.map(renderInline)}
				</p>
			);
	}
}

interface BlocksProps {
	blocks: ContentBlock[];
	className?: string;
}

export function Blocks({ blocks, className }: BlocksProps) {
	if (blocks.length === 0) return null;
	return <div className={cn("flex flex-col gap-3", className)}>{blocks.map(renderBlock)}</div>;
}
