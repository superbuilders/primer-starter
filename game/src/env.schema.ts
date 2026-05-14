import { z } from "zod";

export const clientEnvSchema = {
	VITE_PRIMER_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
};
