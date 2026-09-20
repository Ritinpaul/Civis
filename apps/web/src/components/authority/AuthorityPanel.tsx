'use client';

import React, { useState } from 'react';
import { useDemo } from '@/lib/store';
import {
  LockClosedIcon,
  CheckIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  InfoCircledIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons';

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
    <div className="p-8 max-w-6xl mx-auto space-y-8 select-none font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
              GOVERNOS SENTINEL
            </span>
            <span className="text-xs font-mono text-[#71717A]">
              RUNTIME PERMISSION & BLAST RADIUS ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            GovernOS Authority Matrix
          </h1>
          <p className="text-sm text-[#8E8EA0] mt-0.5">
            Immutable policy boundaries controlling capability delegation and sensitive data access across the autonomous workforce.
          </p>
        </div>

        {/* Live Denial Tester Button */}
        <div>
          <button
            onClick={triggerLiveDenial}
            disabled={liveDenialActive}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md active:scale-95 ${
              liveDenialActive
                ? 'bg-red-500 text-white shadow-red-500/40'
                : 'bg-[#0E1119] hover:bg-[#151924] text-red-400 border border-red-500/30 hover:border-red-500/60'
            }`}
          >
            <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
            <span>{liveDenialActive ? 'VIOLATION INTERCEPTED' : 'Simulate Live Policy Violation'}</span>
          </button>
        </div>
      </div>

      {/* Live Denial Intercept Banner */}
      {liveDenialActive && (
        <div className="p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/50 shadow-xl shadow-red-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-400 animate-bounce" />
            <div>
              <div className="text-sm font-bold text-white">
                GovernOS Real-Time Interception Active
              </div>
              <div className="text-xs text-[#8E8EA0] font-mono mt-0.5">
                Rogue request to <span className="text-red-400 font-bold">citizen_location_history</span> blocked under <span className="text-red-400 font-bold">CITY-PRIVACY-04</span>. Latency: 2.1ms.
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-mono font-bold">
            BLOCKED
          </span>
        </div>
      )}

      {/* 2D Allow/Deny Matrix Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#71717A]">
          <span>Capability Permission Matrix</span>
          <span>6 Active Policies Enforced</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#080A0F]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#0E1119] font-mono text-[11px] text-[#71717A] uppercase">
                <th className="py-3 px-4">Capability Name</th>
                <th className="py-3 px-3 text-center">Read</th>
                <th className="py-3 px-3 text-center">Execute</th>
                <th className="py-3 px-3 text-center">Delegate</th>
                <th className="py-3 px-3 text-center">Sensitive</th>
                <th className="py-3 px-4">Governing Policy</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono">
              {authorityPolicies.map((pol) => {
                const isFlash = liveDenialActive && pol.capability === 'citizen_location_history';
                const isSelected = selectedPolicy === pol.policyId;

                return (
                  <tr
                    key={pol.capability}
                    onClick={() => setSelectedPolicy(pol.policyId)}
                    className={`cursor-pointer transition-colors ${
                      isFlash
                        ? 'bg-red-500/20'
                        : isSelected
                        ? 'bg-[#151924]'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {pol.capability}
                    </td>

                    {/* Read */}
                    <td className="py-3.5 px-3 text-center">
                      {pol.read ? (
                        <CheckIcon className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <Cross2Icon className="w-4 h-4 text-[#52525B] mx-auto" />
                      )}
                    </td>

                    {/* Execute */}
                    <td className="py-3.5 px-3 text-center">
                      {pol.execute ? (
                        <CheckIcon className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <Cross2Icon className="w-4 h-4 text-[#52525B] mx-auto" />
                      )}
                    </td>

                    {/* Delegate */}
                    <td className="py-3.5 px-3 text-center">
                      {pol.delegate ? (
                        <CheckIcon className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <Cross2Icon className="w-4 h-4 text-[#52525B] mx-auto" />
                      )}
                    </td>

                    {/* Sensitive */}
                    <td className="py-3.5 px-3 text-center">
                      {pol.sensitive ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400 border border-red-500/25 font-bold">
                          YES
                        </span>
                      ) : (
                        <span className="text-[#52525B] text-[11px]">NO</span>
                      )}
                    </td>

                    {/* Policy ID */}
                    <td className="py-3.5 px-4 text-[#8E8EA0] hover:text-indigo-400 transition-colors">
                      <span className="underline decoration-dotted">{pol.policyId}</span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-right">
                      {pol.status === 'allowed' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          ALLOWED
                        </span>
                      )}
                      {pol.status === 'denied' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/25">
                          DENIED
                        </span>
                      )}
                      {pol.status === 'restricted' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
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
        <div className="p-6 rounded-2xl bg-[#0E1119] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <LockClosedIcon className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono font-bold text-white">
                POLICY INSPECTOR: {selectedPolicy}
              </span>
            </div>
            <span className="text-xs font-mono text-[#71717A]">
              {activeDetail.statute}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#71717A] block mb-1">
                Policy Title
              </span>
              <span className="text-white font-semibold">{activeDetail.title}</span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#71717A] block mb-1">
                Mandatory Constraint
              </span>
              <span className="text-[#8E8EA0] leading-relaxed">
                {activeDetail.constraint}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#71717A] block mb-1">
                Blast Radius Enclosure
              </span>
              <span className="text-[#8E8EA0] leading-relaxed">
                {activeDetail.blastRadius}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
