import { PrimerSession } from "@/components/primer/session";
import { env } from "@/env";
import { getPrimerAccessToken } from "@/lib/primer/get-token";

export const dynamic = "force-dynamic";

export default async function Home() {
	const accessToken = await getPrimerAccessToken();
	return (
		<main className="flex w-full flex-1 flex-col">
			<PrimerSession accessToken={accessToken} origin={env.PRIMER_ORIGIN} />
		</main>
	);
}
