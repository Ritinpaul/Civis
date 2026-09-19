export type DemoStage =
  | 'idle'
  | 'incident_detected'
  | 'investigating'
  | 'capability_gap'
  | 'evaluating'
  | 'evaluation_failed'
  | 'repairing'
  | 'verified'
  | 'joining_workforce'
  | 'resolved';

export type EventSource =
  | 'GEMINI'
  | 'ORCHESTRATOR'
  | 'TRUST'
  | 'GOVERNOS'
  | 'A2A'
  | 'WORKFORCE'
  | 'RESULT';

export type EventStatus = 'info' | 'warning' | 'error' | 'success';

export interface IncidentEvent {
  id: string;
  timestamp: string;
  source: EventSource;
  title: string;
  detail: string;
  status: EventStatus;
  elapsedMs?: number;
  metadata?: Record<string, any>;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'evaluating' | 'idle' | 'blocked' | 'new';
  trustScore: number;
  capabilities: string[];
  isNew?: boolean;
}

export interface EvaluationTest {
  id: string;
  name: string;
  category: 'Safety' | 'Policy' | 'Reliability' | 'A2A Protocol';
  status: 'passed' | 'failed' | 'pending' | 'running';
  score: number;
  policyId?: string;
  detail?: string;
  remediation?: string;
}

export interface AuthorityPolicy {
  capability: string;
  read: boolean;
  execute: boolean;
  delegate: boolean;
  sensitive: boolean;
  policyId: string;
  description: string;
  status: 'allowed' | 'denied' | 'restricted';
}

export interface DemoState {
  stage: DemoStage;
  activeScreen: 'command' | 'timeline' | 'workforce' | 'evaluation' | 'authority' | 'growth';
  isAutoPlaying: boolean;
  playbackSpeed: number; // 1x, 2x, 4x
  incident: {
    id: string;
    title: string;
    description: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    location: string;
    source: string;
    timestamp: string;
  };
  metrics: {
    agentCount: number;
    capabilityCount: number;
    activeIncidents: number;
    trustScore: number;
  };
  events: IncidentEvent[];
  agents: Agent[];
  evaluationTests: EvaluationTest[];
  authorityPolicies: AuthorityPolicy[];
  capabilityModalOpen: boolean;
  liveDenialActive: boolean;
}
