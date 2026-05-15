import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = { ...loadEnv(mode, process.cwd(), "VITE_"), ...process.env };
	const isEmbedded = env.VITE_IS_EMBEDDED !== "false";

	return {
		base: "./",
		build: {
			outDir: isEmbedded ? "../public/game" : "dist",
			emptyOutDir: true,
		},
		define: {
			"import.meta.env.VITE_IS_EMBEDDED": JSON.stringify(String(isEmbedded)),
		},
		optimizeDeps: {
			exclude: ["temml"],
		},
		plugins: [react(), tailwindcss()],
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
				"@shared": fileURLToPath(new URL("../shared", import.meta.url)),
			},
		},
	};
});
