import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentForge AI | Autonomous Coding & Evidence-Backed Test Repair",
  description: "AI-assisted coding and test-repair workspace powered by NVIDIA Nemotron on Nebius Token Factory. Safe sandbox execution, bounded iterative repairs, and verifiable test evidence.",
  keywords: ["AI Agent", "NVIDIA Nemotron", "Nebius Token Factory", "Automated Test Repair", "Code Generation", "Developer Tools"]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-forge-950 text-forge-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

