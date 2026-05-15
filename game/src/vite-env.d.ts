/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_IS_EMBEDDED: "true" | "false";
	readonly VITE_PRIMER_PUBLISHABLE_KEY?: string;
}
