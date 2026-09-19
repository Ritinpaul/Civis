'use client';

import React from 'react';
import { useDemo } from '@/lib/store';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  Zap,
  Cpu,
  Radar,
  X,
  ArrowRight,
} from 'lucide-react';

export function CapabilityGapModal() {
  const { capabilityModalOpen, closeCapabilityModal, selectCandidate, stage } = useDemo();

  if (!capabilityModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl bg-surface-1 border border-border-strong rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-muted border border-amber-border text-amber">
              <AlertTriangle className="w-5 h-5 text-amber" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-primary">
                Workforce Capability Gap Detected
              </h2>
              <p className="text-xs text-primary-secondary font-mono">
                TRIGGER: INC-2047 • MISSING: flood_passability.calc
              </p>
            </div>
          </div>
          <button
            onClick={closeCapabilityModal}
            className="p-1 rounded-md text-primary-muted hover:text-primary hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Diagnostic Context Banner */}
          <div className="p-4 rounded-lg bg-surface-2 border border-border flex items-start gap-4">
            <div className="p-2.5 rounded-full bg-indigo-muted border border-indigo-border text-indigo mt-0.5">
              <Radar className="w-5 h-5 text-indigo animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-primary">
                Hydraulic Clearance Estimation Required
              </div>
              <p className="text-xs text-primary-secondary leading-relaxed">
                Gemini Vision detected water depth exceeding transit limits at Pier 4. Current civic agents cannot compute dynamic vehicular clearance ratios under turbulent flow. A verified specialist agent must be ingested into the workforce mesh.
              </p>
            </div>
          </div>

          {/* Candidate Agents Comparison */}
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-primary-muted mb-3">
              Evaluated Candidates in Agent Catalog
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Candidate 1: Passage Assessment Agent (Recommended) */}
              <div className="relative p-5 rounded-lg bg-surface-2/80 border-2 border-indigo hover:border-indigo transition-all flex flex-col justify-between group">
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-muted text-indigo border border-indigo-border">
                  RECOMMENDED
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo/20 border border-indigo flex items-center justify-center text-indigo">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-primary">
                        Passage Assessment Agent
                      </div>
                      <div className="text-xs font-mono text-primary-muted">
                        v1.0.0 • Civil Hydraulics
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-primary-secondary leading-normal">
                    Specialized neural-hydraulic model trained on municipal flood telemetry and emergency transit tolerances.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border font-mono text-[11px]">
                    <div>
                      <span className="text-primary-muted block">Trust Score</span>
                      <span className="text-emerald font-semibold">96 / 100</span>
                    </div>
                    <div>
                      <span className="text-primary-muted block">A2A Protocol</span>
                      <span className="text-primary font-semibold">V2 Compatible</span>
                    </div>
                    <div>
                      <span className="text-primary-muted block">Capability</span>
                      <span className="text-indigo font-semibold">flood_passability</span>
                    </div>
                    <div>
                      <span className="text-primary-muted block">GovernOS Check</span>
                      <span className="text-amber font-semibold">Battery Required</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border">
                  <button
                    onClick={() => selectCandidate('candidate-passage')}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-indigo hover:bg-indigo/90 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-glow"
                  >
                    <span>Ingest & Run GovernOS Battery</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Candidate 2: Unverified Scraper (Disqualified) */}
              <div className="p-5 rounded-lg bg-surface-2/40 border border-border opacity-70 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-3 border border-border flex items-center justify-center text-primary-muted">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-primary-secondary">
                          Hydra-Web-Scraper Agent
                        </div>
                        <div className="text-xs font-mono text-primary-muted">
                          v0.4.2 • Public Web Scraper
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-crimson-muted text-crimson border border-crimson-border">
                      DISQUALIFIED
                    </span>
                  </div>

                  <p className="text-xs text-primary-muted leading-normal">
                    Third-party web crawler that scrapes unverified social media reports for water depth claims.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border font-mono text-[11px]">
                    <div>
                      <span className="text-primary-muted block">Trust Score</span>
                      <span className="text-crimson font-semibold">54 / 100</span>
                    </div>
                    <div>
                      <span className="text-primary-muted block">A2A Protocol</span>
                      <span className="text-crimson font-semibold">Incompatible</span>
                    </div>
                    <div>
                      <span className="text-primary-muted block">Blast Radius</span>
                      <span className="text-crimson font-semibold">UNBOUNDED</span>
                    </div>
                    <div>
                      <span className="text-primary-muted block">GovernOS Status</span>
                      <span className="text-crimson font-semibold">REJECTED</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border">
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-surface-3 text-primary-muted font-medium text-xs cursor-not-allowed border border-border"
                  >
                    <XCircle className="w-4 h-4 text-crimson" />
                    <span>Failed Minimum Trust Threshold</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
