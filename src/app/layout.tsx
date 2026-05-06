import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Primer",
	description: "Adaptive learning, powered by the Primer SDK.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${geistSans.variable} h-full antialiased`}>
			<body className="flex min-h-full flex-col bg-background text-foreground">
				<header className="flex items-center gap-3 border-b border-border px-6 py-4">
					<Image
						src="/primer-blackbg-icon.png"
						alt="Primer"
						width={32}
						height={32}
						className="rounded-md"
						priority
						unoptimized
					/>
					<span className="text-lg font-semibold tracking-tight">Primer</span>
				</header>
				{children}
			</body>
		</html>
	);
}
