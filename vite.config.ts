import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { z } from "zod";

import { clientEnvSchema } from "./src/env.schema";

const envSchema = z.object(clientEnvSchema);

function validateEnv(mode: string) {
	const parsed = envSchema.safeParse({
		...loadEnv(mode, process.cwd(), "VITE_"),
		...process.env,
	});

	if (parsed.success) return;

	const issues = parsed.error.issues
		.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
		.join("\n");

	throw new Error(`Invalid environment variables:\n${issues}`);
}

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
