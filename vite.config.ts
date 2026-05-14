import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

import { primerEnvSchema } from "./shared/primer";

export default defineConfig(({ mode }) => {
	validateEnv(mode);

	return {
		plugins: [react(), tailwindcss()],
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
			},
		},
	};
});

function validateEnv(mode: string) {
	const { success, error } = primerEnvSchema.safeParse({
		...loadEnv(mode, process.cwd(), "VITE_"),
		...process.env,
	});

	if (success) return;

	const issues = error.issues
		.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
		.join("\n");

	throw new Error(`Invalid environment variables:\n${issues}`);
}
