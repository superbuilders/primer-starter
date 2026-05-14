import { z } from "zod";

export const publishableKeySchema = z
	.string()
	.startsWith("pk_")
	.refine((value) => value !== "pk_replace_me", {
		message: "Replace pk_replace_me with your Primer publishable key",
	});

export const primerEnvSchema = z.object({
	VITE_PRIMER_PUBLISHABLE_KEY: publishableKeySchema,
});
