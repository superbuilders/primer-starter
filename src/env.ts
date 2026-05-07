import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	},
	client: {
		NEXT_PUBLIC_APP_URL: z.url().optional(),
		NEXT_PUBLIC_PRIMER_ORIGIN: z.url(),
		NEXT_PUBLIC_PRIMER_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
		NEXT_PUBLIC_PRIMER_ORIGIN: process.env.NEXT_PUBLIC_PRIMER_ORIGIN,
		NEXT_PUBLIC_PRIMER_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PRIMER_PUBLISHABLE_KEY,
	},
	emptyStringAsUndefined: true,
});
