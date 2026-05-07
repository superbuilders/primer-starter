import { z } from "zod";

export const clientEnvSchema = {
	VITE_APP_URL: z.url().optional(),
	VITE_PRIMER_ORIGIN: z.url(),
	VITE_PRIMER_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
};
