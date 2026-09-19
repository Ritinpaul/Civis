'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  DemoStage,
  DemoState,
  IncidentEvent,
  Agent,
  EvaluationTest,
  AuthorityPolicy,
} from '@/types/demo';

interface DemoContextType extends DemoState {
  setScreen: (screen: DemoState['activeScreen']) => void;
  startDemo: () => void;
  pauseDemo: () => void;
  resetDemo: () => void;
  stepNext: () => void;
  setSpeed: (speed: number) => void;
  openCapabilityModal: () => void;
  closeCapabilityModal: () => void;
  selectCandidate: (agentId: string) => void;
  repairAgent: () => void;
  triggerLiveDenial: () => void;
}

const INITIAL_INCIDENT = {
  id: 'INC-2047',
  title: 'Bridge Pier 4 Inundation & Hazard',
  description: 'Uncalibrated water surge detected near downtown arterial bridge. Roadway passability uncertain for emergency vehicles.',
  severity: 'HIGH' as const,
  location: 'Pier 4 — Riverside Arterial, Ward 7',
  source: 'Gemini 1.5 Pro Multimodal Vision',
  timestamp: 'Just now',
};

const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-orchestrator',
    name: 'AgentVerse Core',
    role: 'Workforce Orchestrator',
    status: 'active',
    trustScore: 99,
    capabilities: ['workflow.dispatch', 'capability.discover', 'agent.route'],
  },
  {
    id: 'agent-vision',
    name: 'Gemini Vision Sensor',
    role: 'Multimodal Perception',
    status: 'active',
    trustScore: 98,
    capabilities: ['multimodal.analyze', 'damage.classify', 'hazard.detect'],
  },
  {
    id: 'agent-governos',
    name: 'GovernOS Sentinel',
    role: 'Policy & Safety Enforcer',
    status: 'active',
    trustScore: 99,
    capabilities: ['policy.enforce', 'blast_radius.bound', 'audit.seal'],
  },
  {
    id: 'agent-dispatch',
    name: 'Civic Dispatcher',
    role: 'Infrastructure Control',
    status: 'active',
    trustScore: 92,
    capabilities: ['route.plan', 'barrier.deploy', 'alert.broadcast'],
  },
];

const INITIAL_TESTS: EvaluationTest[] = [
  { id: 'T01', name: 'Input Boundary Sanitization', category: 'Safety', status: 'passed', score: 99 },
  { id: 'T02', name: 'Memory & Context Isolation', category: 'Safety', status: 'passed', score: 98 },
  {
    id: 'T03',
    name: 'City Privacy Policy Compliance (CITY-PRIVACY-02)',
    category: 'Policy',
    status: 'pending',
    score: 0,
    policyId: 'CITY-PRIVACY-02',
    detail: 'Candidate requested unauthorized access to citizen location history and resident identity records.',
    remediation: 'Scope reduction patch: Strip citizen PII access. Bind capability to anonymous telemetry only.',
  },
  { id: 'T04', name: 'Tool Access Scope Verification', category: 'Policy', status: 'passed', score: 95 },
  { id: 'T05', name: 'A2A Communication Protocol V2', category: 'A2A Protocol', status: 'passed', score: 97 },
  { id: 'T06', name: 'Blast Radius & Failure Containment', category: 'Safety', status: 'passed', score: 99 },
  { id: 'T07', name: 'Deterministic Hazard Output', category: 'Reliability', status: 'passed', score: 96 },
];

const INITIAL_POLICIES: AuthorityPolicy[] = [
  {
    capability: 'location.resolve',
    read: true,
    execute: true,
    delegate: true,
    sensitive: false,
    policyId: 'INFRA-SPATIAL-01',
    description: 'Resolve spatial coordinates against city arterial grid.',
    status: 'allowed',
  },
  {
    capability: 'flood_passability.calc',
    read: true,
    execute: true,
    delegate: true,
    sensitive: false,
    policyId: 'HAZARD-SURFACE-03',
    description: 'Compute depth-to-vehicle clearance ratio for emergency transit.',
    status: 'allowed',
  },
  {
    capability: 'infrastructure.query',
    read: true,
    execute: false,
    delegate: false,
    sensitive: false,
    policyId: 'PUBLIC-DATA-01',
    description: 'Query public bridge structural and elevation profiles.',
    status: 'allowed',
  },
  {
    capability: 'resident_identity.lookup',
    read: false,
    execute: false,
    delegate: false,
    sensitive: true,
    policyId: 'CITY-PRIVACY-02',
    description: 'Inspect individual citizen identities or home addresses.',
    status: 'denied',
  },
  {
    capability: 'citizen_location_history',
    read: false,
    execute: false,
    delegate: false,
    sensitive: true,
    policyId: 'CITY-PRIVACY-04',
    description: 'Track longitudinal GPS or device coordinates of residents.',
    status: 'denied',
  },
  {
    capability: 'power_grid.emergency_shutoff',
    read: false,
    execute: false,
    delegate: false,
    sensitive: true,
    policyId: 'CRITICAL-INFRA-01',
    description: 'Tripping substation breakers requires multi-signature human approval.',
    status: 'restricted',
  },
];

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [stage, setStage] = useState<DemoStage>('idle');
  const [activeScreen, setActiveScreen] = useState<DemoState['activeScreen']>('command');
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [incident, setIncident] = useState(INITIAL_INCIDENT);
  const [metrics, setMetrics] = useState({
    agentCount: 4,
    capabilityCount: 12,
    activeIncidents: 1,
    trustScore: 94,
  });
  const [events, setEvents] = useState<IncidentEvent[]>([
    {
      id: 'EVT-001',
      timestamp: '00:01.120',
      source: 'GEMINI',
      title: 'Multimodal Surge Anomaly Detected',
      detail: 'Gemini Vision sensor identified 0.85m water accumulation at Pier 4. Confidence: 98.4%.',
      status: 'warning',
      elapsedMs: 1120,
    },
    {
      id: 'EVT-002',
      timestamp: '00:01.840',
      source: 'ORCHESTRATOR',
      title: 'Incident INC-2047 Registered',
      detail: 'Classified as HIGH severity flood risk. Initiating workforce capability scan.',
      status: 'info',
      elapsedMs: 1840,
    },
  ]);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [evaluationTests, setEvaluationTests] = useState<EvaluationTest[]>(INITIAL_TESTS);
  const [authorityPolicies, setAuthorityPolicies] = useState<AuthorityPolicy[]>(INITIAL_POLICIES);
  const [capabilityModalOpen, setCapabilityModalOpen] = useState(false);
  const [liveDenialActive, setLiveDenialActive] = useState(false);

  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to append a timestamped event
  const addEvent = useCallback((event: Omit<IncidentEvent, 'id' | 'timestamp' | 'elapsedMs'>) => {
    const now = new Date();
    const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0')}`;
    const newEvt: IncidentEvent = {
      ...event,
      id: `EVT-${Date.now().toString().slice(-4)}`,
      timestamp: timeStr,
      elapsedMs: Date.now(),
    };
    setEvents((prev) => [newEvt, ...prev]);
  }, []);

  // Stage transition logic
  const advanceToStage = useCallback((nextStage: DemoStage) => {
    setStage(nextStage);

    switch (nextStage) {
      case 'incident_detected':
        addEvent({
          source: 'GEMINI',
          title: 'High-Resolution Flood Boundary Plotted',
          detail: 'Water crest rising at 4cm/min. Arterial transit lane 1 submerged.',
          status: 'warning',
        });
        break;

      case 'investigating':
        addEvent({
          source: 'ORCHESTRATOR',
          title: 'Synthesizing Response Strategy',
          detail: 'Scanning active workforce for flood depth passability estimation capability.',
          status: 'info',
        });
        break;

      case 'capability_gap':
        addEvent({
          source: 'ORCHESTRATOR',
          title: 'Workforce Capability Gap Detected',
          detail: 'No registered agent possesses verified capability: flood_passability.calc.',
          status: 'warning',
        });
        setCapabilityModalOpen(true);
        break;

      case 'evaluating':
        setCapabilityModalOpen(false);
        addEvent({
          source: 'TRUST',
          title: 'Candidate Agent "Passage Assessment" Ingestion',
          detail: 'Executing automated GovernOS verification battery T01–T07.',
          status: 'info',
        });
        setActiveScreen('evaluation');
        setEvaluationTests((prev) =>
          prev.map((t) => (t.id === 'T03' ? { ...t, status: 'running' } : t))
        );
        break;

      case 'evaluation_failed':
        setEvaluationTests((prev) =>
          prev.map((t) =>
            t.id === 'T03'
              ? {
                  ...t,
                  status: 'failed',
                  score: 34,
                }
              : t
          )
        );
        addEvent({
          source: 'GOVERNOS',
          title: 'GovernOS Policy Block: CITY-PRIVACY-02',
          detail: 'Candidate requested unauthorized access to citizen location history. Ingestion HALTED.',
          status: 'error',
        });
        break;

      case 'repairing':
        addEvent({
          source: 'GOVERNOS',
          title: 'Automated Remediation Patch Synthesized',
          detail: 'Stripping sensitive PII tool definitions. Binding execution to anonymous sensor telemetry.',
          status: 'info',
        });
        break;

      case 'verified':
        setEvaluationTests((prev) =>
          prev.map((t) =>
            t.id === 'T03'
              ? {
                  ...t,
                  status: 'passed',
                  score: 96,
                  detail: 'Remediation applied. Tool permissions strictly confined to anonymous telemetry.',
                }
              : t
          )
        );
        addEvent({
          source: 'TRUST',
          title: 'GovernOS Verification Sealed: 100% Passed',
          detail: 'Candidate passed all 7 safety and compliance batteries. Cryptographic trust token issued.',
          status: 'success',
        });
        break;

      case 'joining_workforce':
        setActiveScreen('workforce');
        const newAgent: Agent = {
          id: 'agent-passage',
          name: 'Passage Assessment Agent',
          role: 'Hydraulic Transit Specialist',
          status: 'new',
          trustScore: 96,
          capabilities: ['flood_passability.calc', 'location.resolve'],
          isNew: true,
        };
        setAgents((prev) => (prev.some((a) => a.id === newAgent.id) ? prev : [...prev, newAgent]));
        setMetrics((prev) => ({
          ...prev,
          agentCount: 5,
          capabilityCount: 13,
          trustScore: 96,
        }));
        addEvent({
          source: 'WORKFORCE',
          title: 'Workforce Expanded: 4 → 5 Agents',
          detail: 'Passage Assessment Agent integrated into live A2A mesh. Capabilities: 12 → 13.',
          status: 'success',
        });
        break;

      case 'resolved':
        addEvent({
          source: 'A2A',
          title: 'A2A Task Delegation Executed',
          detail: 'Civic Dispatcher queried Passage Agent: Clearance ratio 0.42. Diversion barrier deployed.',
          status: 'success',
        });
        addEvent({
          source: 'RESULT',
          title: 'Incident INC-2047 Mitigated',
          detail: 'Traffic safely rerouted around Pier 4. Immutable audit trail locked in provenance ledger.',
          status: 'success',
        });
        setMetrics((prev) => ({ ...prev, activeIncidents: 0 }));
        setActiveScreen('growth');
        break;
    }
  }, [addEvent]);

  // Step Next in the 7-chapter story
  const stepNext = useCallback(() => {
    switch (stage) {
      case 'idle':
        advanceToStage('incident_detected');
        break;
      case 'incident_detected':
        advanceToStage('investigating');
        break;
      case 'investigating':
        advanceToStage('capability_gap');
        break;
      case 'capability_gap':
        advanceToStage('evaluating');
        break;
      case 'evaluating':
        advanceToStage('evaluation_failed');
        break;
      case 'evaluation_failed':
        advanceToStage('repairing');
        break;
      case 'repairing':
        advanceToStage('verified');
        break;
      case 'verified':
        advanceToStage('joining_workforce');
        break;
      case 'joining_workforce':
        advanceToStage('resolved');
        break;
      case 'resolved':
        // Loop back or stay resolved
        break;
    }
  }, [stage, advanceToStage]);

  // Auto-play driver
  useEffect(() => {
    if (!isAutoPlaying) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    const interval = Math.max(1200 / playbackSpeed, 600);
    autoPlayTimerRef.current = setInterval(() => {
      setStage((curr) => {
        if (curr === 'resolved') {
          setIsAutoPlaying(false);
          return curr;
        }
        stepNext();
        return curr;
      });
    }, interval);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, playbackSpeed, stepNext]);

  const startDemo = useCallback(() => {
    setIsAutoPlaying(true);
    if (stage === 'idle') {
      stepNext();
    }
  }, [stage, stepNext]);

  const pauseDemo = useCallback(() => {
    setIsAutoPlaying(false);
  }, []);

  const resetDemo = useCallback(() => {
    setIsAutoPlaying(false);
    setStage('idle');
    setActiveScreen('command');
    setIncident(INITIAL_INCIDENT);
    setMetrics({
      agentCount: 4,
      capabilityCount: 12,
      activeIncidents: 1,
      trustScore: 94,
    });
    setAgents(INITIAL_AGENTS);
    setEvaluationTests(INITIAL_TESTS);
    setAuthorityPolicies(INITIAL_POLICIES);
    setCapabilityModalOpen(false);
    setLiveDenialActive(false);
    setEvents([
      {
        id: 'EVT-001',
        timestamp: '00:01.120',
        source: 'GEMINI',
        title: 'Multimodal Surge Anomaly Detected',
        detail: 'Gemini Vision sensor identified 0.85m water accumulation at Pier 4. Confidence: 98.4%.',
        status: 'warning',
        elapsedMs: 1120,
      },
      {
        id: 'EVT-002',
        timestamp: '00:01.840',
        source: 'ORCHESTRATOR',
        title: 'Incident INC-2047 Registered',
        detail: 'Classified as HIGH severity flood risk. Initiating workforce capability scan.',
        status: 'info',
        elapsedMs: 1840,
      },
    ]);
  }, []);

  const selectCandidate = useCallback((agentId: string) => {
    if (agentId === 'candidate-passage') {
      advanceToStage('evaluating');
      setTimeout(() => advanceToStage('evaluation_failed'), 1200);
    }
  }, [advanceToStage]);

  const repairAgent = useCallback(() => {
    advanceToStage('repairing');
    setTimeout(() => {
      advanceToStage('verified');
      setTimeout(() => {
        advanceToStage('joining_workforce');
      }, 1500);
    }, 1200);
  }, [advanceToStage]);

  const triggerLiveDenial = useCallback(() => {
    setLiveDenialActive(true);
    addEvent({
      source: 'GOVERNOS',
      title: 'LIVE DENIAL: Policy Violation Prevented',
      detail: 'Agent requested citizen_location_history. GovernOS actively blocked telemetry access under CITY-PRIVACY-04.',
      status: 'error',
    });
    setTimeout(() => {
      setLiveDenialActive(false);
    }, 2400);
  }, [addEvent]);

  return (
    <DemoContext.Provider
      value={{
        stage,
        activeScreen,
        isAutoPlaying,
        playbackSpeed,
        incident,
        metrics,
        events,
        agents,
        evaluationTests,
        authorityPolicies,
        capabilityModalOpen,
        liveDenialActive,
        setScreen: setActiveScreen,
        startDemo,
        pauseDemo,
        resetDemo,
        stepNext,
        setSpeed: setPlaybackSpeed,
        openCapabilityModal: () => setCapabilityModalOpen(true),
        closeCapabilityModal: () => setCapabilityModalOpen(false),
        selectCandidate,
        repairAgent,
        triggerLiveDenial,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
