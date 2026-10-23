import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DateMind AI — Autonomous Agentic Dating Platform',
  description:
    'Where every person is represented by an autonomous AI agent. Analyzes public LinkedIn & Instagram profiles, engages in multi-round dating simulations, and evaluates deep compatibility.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#090a0f] text-gray-100 antialiased selection:bg-pink-500/30 selection:text-pink-200">
        {children}
      </body>
    </html>
  );
}
