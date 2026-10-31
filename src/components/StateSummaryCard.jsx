// src/components/StateSummaryCard.jsx
import React from 'react';
import { Map, UserCheck, Shield } from 'lucide-react';

export function StateSummaryCard({ stats, onClear }) {
  // Support both explicit props or fallback calculation from candidates array if provided in stats
  const incumbents = stats.incumbentsCount ?? stats.incumbents ?? 0;
  const challengers = stats.challengersCount ?? stats.challengers ?? 0;

  return (
      <div className="mt-6 bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 shadow-xl animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-cyan-300 flex items-center space-x-1.5">
          <span>{stats.stateName} ({stats.code}) Selected</span>
        </span>
          <button
              onClick={onClear}
              className="text-[11px] font-semibold text-slate-400 hover:text-white underline transition-colors"
          >
            Clear Selection
          </button>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {/* Incumbents Box */}
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex flex-col justify-center items-center">
          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider flex items-center justify-center gap-1">
            <UserCheck className="w-3 h-3 text-emerald-400 inline" />
            <span>Incumbents</span>
          </span>
            <span className="font-bold text-emerald-400 text-sm mt-0.5">{incumbents}</span>
          </div>

          {/* Challengers Box */}
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex flex-col justify-center items-center">
          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider flex items-center justify-center gap-1">
            <Shield className="w-3 h-3 text-indigo-400 inline" />
            <span>Challengers</span>
          </span>
            <span className="font-bold text-indigo-400 text-sm mt-0.5">{challengers}</span>
          </div>

          {/* Parties Box */}
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex flex-col justify-center items-center">
          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
            Parties
          </span>
            <span className="font-bold text-slate-200 mt-0.5">
            <span className="text-blue-400">{stats.democrats || 0}D</span> / <span className="text-red-400">{stats.republicans || 0}R</span>
          </span>
          </div>

          {/* Bills Box */}
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex flex-col justify-center items-center">
          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
            Bills
          </span>
            <span className="font-bold text-cyan-400 text-sm mt-0.5">{stats.totalBills || 0}</span>
          </div>
        </div>
      </div>
  );
}