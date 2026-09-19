import type { Metadata } from 'next';
import './globals.css';
import { DemoProvider } from '@/lib/store';
import { AppShell } from '@/components/shell/AppShell';

export const metadata: Metadata = {
  title: 'AgentVerse — Autonomous Agent Workforce Command Center',
  description:
    'Cinematic command interface for a trusted autonomous-agent workforce with Gemini multimodal perception and GovernOS safety enforcement.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-primary antialiased">
        <DemoProvider>
          <AppShell>{children}</AppShell>
        </DemoProvider>
      </body>
    </html>
  );
}
