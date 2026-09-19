'use client';

import React, { useState } from 'react';
import { useDemo } from '@/lib/store';
import {
  Lock,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  AlertOctagon,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export function AuthorityPanel() {
  const { authorityPolicies, liveDenialActive, triggerLiveDenial } = useDemo();
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>('CITY-PRIVACY-02');

  const policyDetails: Record<string, { title: string; statute: string; constraint: string; blastRadius: string }> = {
    'CITY-PRIVACY-02': {
      title: 'Citizen Identity & PII Isolation Statute',
      statute: 'Municipal Ordinance § 14-B',
      constraint: 'Strictly forbids automated correlation of sensor telemetry with resident identity or tax records.',
      blastRadius: 'Zero PII ingress into autonomous agent working memory.',
    },
    'CITY-PRIVACY-04': {
      title: 'Longitudinal Geolocation Surveillance Prohibition',
      statute: 'Civic Freedom Act § 9-C',
      constraint: 'Autonomous agents may not track, store, or cross-reference temporal GPS routes of individual citizens.',
      blastRadius: 'All spatial lookups must be anonymized bounding boxes only.',
    },
    'CRITICAL-INFRA-01': {
      title: 'Critical Infrastructure Actuator Safety Lock',
      statute: 'Public Utilities Code § 101',
      constraint: 'Substation breaker toggling and floodgate actuation requires dual-key cryptographic confirmation with human operator in the loop.',
      blastRadius: 'No single agent possesses unilateral write access.',
    },
    'INFRA-SPATIAL-01': {
      title: 'Arterial Road Network Spatial Resolution',
      statute: 'Transportation Data Standard V3',
      constraint: 'Permits querying municipal road centerlines and bridge piers for routing emergency vehicles.',
      blastRadius: 'Public read-only spatial index.',
    },
    'HAZARD-SURFACE-03': {
      title: 'Surface Water Hydraulic Clearance Standards',
      statute: 'Emergency Transit Protocol § 4',
      constraint: 'Enables real-time calculation of vehicular passability based on water depth and flow velocity.',
      blastRadius: 'Constrained to arterial transit corridors.',
    },
    'PUBLIC-DATA-01': {
      title: 'Public Infrastructure Inventory Access',
      statute: 'Open Data Initiative 2024',
      constraint: 'Unrestricted read-only access to structural bridge specifications and public elevation benchmarks.',
      blastRadius: 'Public read-only repository.',
    },
  };

  const activeDetail = selectedPolicy ? policyDetails[selectedPolicy] : null;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-purple-muted text-purple border border-purple-border">
              GOVERNOS SENTINEL
            </span>
            <span className="text-xs font-mono text-primary-muted">
              RUNTIME PERMISSION & BLAST RADIUS ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            GovernOS Authority Matrix
          </h1>
          <p className="text-sm text-primary-secondary mt-0.5">
            Immutable policy boundaries controlling capability delegation and sensitive data access across the autonomous workforce.
          </p>
        </div>

        {/* Live Denial Tester Button */}
        <div>
          <button
            onClick={triggerLiveDenial}
            disabled={liveDenialActive}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-bold transition-all shadow-md ${
              liveDenialActive
                ? 'bg-crimson text-white animate-flash-crimson shadow-crimson-glow'
                : 'bg-surface-2 hover:bg-surface-hover text-crimson border border-crimson/40 hover:border-crimson'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-crimson" />
            <span>{liveDenialActive ? 'VIOLATION INTERCEPTED' : 'Simulate Live Policy Violation'}</span>
          </button>
        </div>
      </div>

      {/* Live Denial Intercept Banner */}
      {liveDenialActive && (
        <div className="p-5 rounded-xl bg-crimson-muted/40 border-2 border-crimson shadow-xl shadow-crimson-glow flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-6 h-6 text-crimson animate-bounce" />
            <div>
              <div className="text-sm font-bold text-primary">
                GovernOS Real-Time Interception Active
              </div>
              <div className="text-xs text-primary-secondary font-mono mt-0.5">
                Rogue request to <span className="text-crimson font-bold">citizen_location_history</span> blocked under <span className="text-crimson font-bold">CITY-PRIVACY-04</span>. Latency: 2.1ms.
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded bg-crimson text-white text-xs font-mono font-bold">
            BLOCKED
          </span>
        </div>
      )}

      {/* 2D Allow/Deny Matrix Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-primary-muted">
          <span>Capability Permission Matrix</span>
          <span>6 Active Policies Enforced</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-surface-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-2/60 font-mono text-[11px] text-primary-muted uppercase">
                <th className="py-3 px-4">Capability Name</th>
                <th className="py-3 px-3 text-center">Read</th>
                <th className="py-3 px-3 text-center">Execute</th>
                <th className="py-3 px-3 text-center">Delegate</th>
                <th className="py-3 px-3 text-center">Sensitive</th>
                <th className="py-3 px-4">Governing Policy</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono">
              {authorityPolicies.map((pol) => {
                const isFlash = liveDenialActive && pol.capability === 'citizen_location_history';
                const isSelected = selectedPolicy === pol.policyId;

                return (
                  <tr
                    key={pol.capability}
                    onClick={() => setSelectedPolicy(pol.policyId)}
                    className={`cursor-pointer transition-colors ${
                      isFlash
                        ? 'bg-crimson/25 animate-flash-crimson'
                        : isSelected
                        ? 'bg-surface-3'
                        : 'hover:bg-surface-hover/50'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-primary">
                      {pol.capability}
                    </td>

                    {/* Read */}
                    <td className="py-3.5 px-3 text-center">
                      {pol.read ? (
                        <Check className="w-4 h-4 text-emerald mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-primary-muted mx-auto opacity-40" />
                      )}
                    </td>

                    {/* Execute */}
                    <td className="py-3.5 px-3 text-center">
                      {pol.execute ? (
                        <Check className="w-4 h-4 text-emerald mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-primary-muted mx-auto opacity-40" />
                      )}
                    </td>

                    {/* Delegate */}
                    <td className="py-3.5 px-3 text-center">
                      {pol.delegate ? (
                        <Check className="w-4 h-4 text-emerald mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-primary-muted mx-auto opacity-40" />
                      )}
                    </td>

                    {/* Sensitive */}
                    <td className="py-3.5 px-3 text-center">
                      {pol.sensitive ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-crimson-muted text-crimson border border-crimson-border font-bold">
                          YES
                        </span>
                      ) : (
                        <span className="text-primary-muted text-[11px]">NO</span>
                      )}
                    </td>

                    {/* Policy ID */}
                    <td className="py-3.5 px-4 text-primary-secondary hover:text-indigo transition-colors">
                      <span className="underline decoration-dotted">{pol.policyId}</span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-right">
                      {pol.status === 'allowed' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-muted text-emerald border border-emerald-border">
                          ALLOWED
                        </span>
                      )}
                      {pol.status === 'denied' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-crimson-muted text-crimson border border-crimson-border">
                          DENIED
                        </span>
                      )}
                      {pol.status === 'restricted' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-muted text-amber border border-amber-border">
                          RESTRICTED
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Policy Inspector Detail Card */}
      {activeDetail && (
        <div className="p-6 rounded-xl bg-surface-2 border border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple" />
              <span className="text-xs font-mono font-bold text-primary">
                POLICY INSPECTOR: {selectedPolicy}
              </span>
            </div>
            <span className="text-xs font-mono text-primary-muted">
              {activeDetail.statute}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-primary-muted block mb-1">
                Policy Title
              </span>
              <span className="text-primary font-semibold">{activeDetail.title}</span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-primary-muted block mb-1">
                Mandatory Constraint
              </span>
              <span className="text-primary-secondary leading-relaxed">
                {activeDetail.constraint}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-primary-muted block mb-1">
                Blast Radius Enclosure
              </span>
              <span className="text-primary-secondary leading-relaxed">
                {activeDetail.blastRadius}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
