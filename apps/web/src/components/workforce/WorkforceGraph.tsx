'use client';

import React, { useMemo, useState } from 'react';
import { useDemo } from '@/lib/store';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  Position,
  Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Sparkles,
  Cpu,
  ShieldCheck,
  Zap,
  Users,
  Layers,
  Activity,
  CheckCircle2,
} from 'lucide-react';

// Custom Node for Gemini Vision
function GeminiNode({ data }: any) {
  return (
    <div className="px-4 py-3 rounded-xl bg-surface-2 border-2 border-indigo shadow-lg shadow-indigo-glow/20 min-w-[190px]">
      <Handle type="source" position={Position.Right} className="!bg-indigo !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 mb-1.5">
        <div className="p-1.5 rounded-lg bg-indigo/20 text-indigo">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-[10px] font-mono font-bold text-indigo uppercase tracking-wider">
          PERCEPTION
        </div>
      </div>
      <div className="text-xs font-bold text-primary">{data.label}</div>
      <div className="text-[10px] font-mono text-primary-muted mt-1">
        Multimodal Analysis • Trust: 98%
      </div>
    </div>
  );
}

// Custom Node for Orchestrator Hub
function OrchestratorNode({ data }: any) {
  return (
    <div className="px-5 py-4 rounded-xl bg-surface-2 border-2 border-primary-secondary shadow-xl min-w-[210px]">
      <Handle type="target" position={Position.Left} className="!bg-indigo !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!bg-purple !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-emerald !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 mb-1.5">
        <div className="p-1.5 rounded-lg bg-surface-3 text-primary">
          <Cpu className="w-4 h-4" />
        </div>
        <div className="text-[10px] font-mono font-bold text-primary-secondary uppercase tracking-wider">
          CORE ORCHESTRATOR
        </div>
      </div>
      <div className="text-xs font-bold text-primary">{data.label}</div>
      <div className="text-[10px] font-mono text-emerald mt-1 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-ping" />
        <span>A2A Dispatch Active</span>
      </div>
    </div>
  );
}

// Custom Node for GovernOS Sentinel
function GovernOSNode({ data }: any) {
  return (
    <div className="px-4 py-3 rounded-xl bg-surface-2 border-2 border-purple shadow-lg shadow-purple-glow/20 min-w-[190px]">
      <Handle type="target" position={Position.Left} className="!bg-purple !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!bg-purple !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 mb-1.5">
        <div className="p-1.5 rounded-lg bg-purple/20 text-purple">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-[10px] font-mono font-bold text-purple uppercase tracking-wider">
          POLICY ENFORCER
        </div>
      </div>
      <div className="text-xs font-bold text-primary">{data.label}</div>
      <div className="text-[10px] font-mono text-primary-muted mt-1">
        Blast Radius Sealed • Trust: 99%
      </div>
    </div>
  );
}

// Custom Node for Civic Dispatcher
function DispatchNode({ data }: any) {
  return (
    <div className="px-4 py-3 rounded-xl bg-surface-2 border-2 border-emerald shadow-lg shadow-emerald-glow/20 min-w-[190px]">
      <Handle type="target" position={Position.Top} className="!bg-emerald !w-2.5 !h-2.5" />
      <Handle type="target" position={Position.Right} className="!bg-emerald !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 mb-1.5">
        <div className="p-1.5 rounded-lg bg-emerald/20 text-emerald">
          <Zap className="w-4 h-4" />
        </div>
        <div className="text-[10px] font-mono font-bold text-emerald uppercase tracking-wider">
          INFRASTRUCTURE ACTUATOR
        </div>
      </div>
      <div className="text-xs font-bold text-primary">{data.label}</div>
      <div className="text-[10px] font-mono text-primary-muted mt-1">
        Barriers & Alerts • Trust: 92%
      </div>
    </div>
  );
}

// Custom Node for Newly Joined Passage Assessment Agent
function PassageNode({ data }: any) {
  return (
    <div className="relative px-5 py-4 rounded-xl bg-surface-1 border-2 border-emerald shadow-2xl shadow-emerald-glow/30 min-w-[220px] animate-pulse">
      <Handle type="target" position={Position.Left} className="!bg-purple !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-emerald !w-2.5 !h-2.5" />
      <div className="absolute -top-3 right-3 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald text-black shadow-md">
        NEWLY JOINED (5th AGENT)
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="p-1.5 rounded-lg bg-emerald/20 text-emerald">
          <Layers className="w-4 h-4" />
        </div>
        <div className="text-[10px] font-mono font-bold text-emerald uppercase tracking-wider">
          SPECIALIST INGESTED
        </div>
      </div>
      <div className="text-xs font-bold text-primary">{data.label}</div>
      <div className="text-[10px] font-mono text-emerald mt-1 font-semibold">
        flood_passability.calc (v1.0.0)
      </div>
    </div>
  );
}

const nodeTypes = {
  gemini: GeminiNode,
  orchestrator: OrchestratorNode,
  governos: GovernOSNode,
  dispatch: DispatchNode,
  passage: PassageNode,
};

export function WorkforceGraph() {
  const { metrics, stage, agents } = useDemo();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const hasPassageAgent = metrics.agentCount >= 5 || stage === 'joining_workforce' || stage === 'resolved';

  // Base Nodes
  const nodes: Node[] = useMemo(() => {
    const list: Node[] = [
      {
        id: 'gemini',
        type: 'gemini',
        position: { x: 50, y: 140 },
        data: { label: 'Gemini Vision Perception' },
      },
      {
        id: 'orchestrator',
        type: 'orchestrator',
        position: { x: 320, y: 130 },
        data: { label: 'AgentVerse Core' },
      },
      {
        id: 'governos',
        type: 'governos',
        position: { x: 620, y: 80 },
        data: { label: 'GovernOS Sentinel' },
      },
      {
        id: 'dispatch',
        type: 'dispatch',
        position: { x: 330, y: 320 },
        data: { label: 'Civic Dispatcher' },
      },
    ];

    if (hasPassageAgent) {
      list.push({
        id: 'passage',
        type: 'passage',
        position: { x: 620, y: 270 },
        data: { label: 'Passage Assessment Agent' },
      });
    }

    return list;
  }, [hasPassageAgent]);

  // Edges
  const edges: Edge[] = useMemo(() => {
    const list: Edge[] = [
      {
        id: 'e-gemini-orch',
        source: 'gemini',
        target: 'orchestrator',
        animated: true,
        style: { stroke: '#6366F1', strokeWidth: 2 },
      },
      {
        id: 'e-orch-gov',
        source: 'orchestrator',
        target: 'governos',
        animated: true,
        style: { stroke: '#818CF8', strokeWidth: 2 },
      },
      {
        id: 'e-orch-disp',
        source: 'orchestrator',
        target: 'dispatch',
        animated: true,
        style: { stroke: '#10B981', strokeWidth: 2 },
      },
    ];

    if (hasPassageAgent) {
      list.push(
        {
          id: 'e-gov-pass',
          source: 'governos',
          target: 'passage',
          animated: true,
          style: { stroke: '#10B981', strokeWidth: 2.5 },
        },
        {
          id: 'e-pass-disp',
          source: 'passage',
          target: 'dispatch',
          animated: true,
          style: { stroke: '#10B981', strokeWidth: 2.5 },
        }
      );
    }

    return list;
  }, [hasPassageAgent]);

  return (
    <div className="h-full w-full flex flex-col select-none">
      {/* Top Banner */}
      <div className="p-6 border-b border-border bg-surface-1/90 backdrop-blur-md flex items-center justify-between z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-indigo-muted text-indigo border border-indigo-border">
              A2A WORKFORCE TOPOLOGY
            </span>
            <span className="text-xs font-mono text-primary-muted">
              FLEET COUNT: {metrics.agentCount} ACTIVE AGENTS
            </span>
          </div>
          <h1 className="text-xl font-bold text-primary">
            Autonomous Agent Workforce Mesh
          </h1>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo" />
            <span className="text-primary-secondary">Perception</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple" />
            <span className="text-primary-secondary">Governance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald" />
            <span className="text-primary-secondary">Actuator / Specialist</span>
          </div>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="flex-1 relative bg-bg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.5}
          maxZoom={1.5}
          className="bg-dot-grid"
        >
          <Background color="#14151B" gap={24} size={1} />
          <Controls className="!bg-surface-2 !border !border-border !fill-white" />
        </ReactFlow>
      </div>
    </div>
  );
}
