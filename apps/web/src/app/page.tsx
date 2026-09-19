'use client';

import React from 'react';
import { useDemo } from '@/lib/store';
import { CommandCenter } from '@/components/command/CommandCenter';
import { IncidentTimeline } from '@/components/incident/IncidentTimeline';
import { WorkforceGraph } from '@/components/workforce/WorkforceGraph';
import { EvaluationPanel } from '@/components/evaluation/EvaluationPanel';
import { AuthorityPanel } from '@/components/authority/AuthorityPanel';
import { WorkforceGrowth } from '@/components/growth/WorkforceGrowth';

export default function Home() {
  const { activeScreen } = useDemo();

  switch (activeScreen) {
    case 'command':
      return <CommandCenter />;
    case 'timeline':
      return <IncidentTimeline />;
    case 'workforce':
      return <WorkforceGraph />;
    case 'evaluation':
      return <EvaluationPanel />;
    case 'authority':
      return <AuthorityPanel />;
    case 'growth':
      return <WorkforceGrowth />;
    default:
      return <CommandCenter />;
  }
}
