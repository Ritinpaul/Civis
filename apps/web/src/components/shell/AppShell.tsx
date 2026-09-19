'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CapabilityGapModal } from '../capability/CapabilityGapModal';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-primary">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-bg bg-dot-grid relative">
          {children}
        </main>
      </div>

      {/* Cinematic Modal Overlay */}
      <CapabilityGapModal />
    </div>
  );
}
