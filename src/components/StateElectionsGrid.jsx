import React from 'react';
import { UserCheck, ExternalLink, RefreshCw, AlertCircle, Award } from 'lucide-react';

export function StateElectionsGrid({ selectedState, data, loading, error }) {
    // 1. Loading State
    if (loading) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                <RefreshCw className="w-8 h-8 text-cyan-400 mx-auto mb-3 animate-spin" />
                <p className="text-sm font-medium text-slate-400">Loading election slates for {selectedState}…</p>
            </div>
        );
    }

    // 2. Error State
    if (error) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-rose-300 mb-1">Failed to load election data</p>
                <p className="text-xs text-slate-500">{error}</p>
            </div>
        );
    }

    // Extract races array support from response model (supports both `races` array and raw `candidates` flat array)
    const races = data?.races || [];
    const flatCandidates = data?.candidates || [];

    // 3. Empty State
    if (races.length === 0 && flatCandidates.length === 0) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400 font-medium text-sm">
                    No active election slates found for state "{selectedState}".
                </p>
            </div>
        );
    }

    // Party Pill Color Helper
    const getPartyBadge = (party) => {
        const p = party?.toLowerCase() || '';
        if (p.includes('democrat')) {
            return 'bg-blue-950/60 text-blue-400 border-blue-800/60';
        }
        if (p.includes('republican')) {
            return 'bg-red-950/60 text-red-400 border-red-800/60';
        }
        if (p.includes('libertarian')) {
            return 'bg-amber-950/60 text-amber-400 border-amber-800/60';
        }
        if (p.includes('green')) {
            return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
        }
        return 'bg-slate-800 text-slate-300 border-slate-700';
    };

    return (
        <div className="space-y-6">
            {races.map((race) => (
                <div
                    key={race.election_id}
                    className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm overflow-hidden"
                >
                    {/* Race Title Header */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5 mb-4">
                        <div className="flex items-center space-x-2.5">
                            <h3 className="text-base font-bold text-slate-100">
                                {race.office === 'Senate' ? 'U.S. Senate' : `U.S. House — District ${race.district}`}
                            </h3>
                            <span className="text-[11px] font-semibold text-slate-400 bg-slate-950 border border-slate-800 px-2.5 py-0.5 rounded-full">
                                {race.election_id}
                            </span>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
                            {race.candidates?.length || 0} Contenders
                        </span>
                    </div>

                    {/* Contenders Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {race.candidates?.map((candidate) => (
                            <div
                                key={candidate.politician_id}
                                className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-colors"
                            >
                                <div className="space-y-1.5 min-w-0 pr-2">
                                    {/* Candidate Name & Badges */}
                                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                        <span className="font-semibold text-slate-100 text-sm truncate">
                                            {candidate.name}
                                        </span>

                                        {candidate.is_incumbent && (
                                            <span className="inline-flex items-center text-[10px] font-medium bg-amber-950/70 text-amber-400 border border-amber-800/60 px-1.5 py-0.5 rounded">
                                                <UserCheck className="w-3 h-3 mr-0.5 shrink-0" /> Incumbent
                                            </span>
                                        )}

                                        {candidate.is_winner && (
                                            <span className="inline-flex items-center text-[10px] font-medium bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                                                <Award className="w-3 h-3 mr-0.5 shrink-0" /> Winner
                                            </span>
                                        )}
                                    </div>

                                    {/* Party Tag & Receipts */}
                                    <div className="text-xs text-slate-400 flex items-center space-x-2.5">
                                        <span className={`px-2 py-0.5 text-[11px] font-medium rounded-md border ${getPartyBadge(candidate.party)}`}>
                                            {candidate.party}
                                        </span>
                                        <span className="text-slate-500">•</span>
                                        <span className="text-slate-300 text-xs font-medium">
                                            Raised: ${Number(candidate.total_receipts || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* External Campaign Link */}
                                {candidate.campaign_url && (
                                    <a
                                        href={candidate.campaign_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-400 hover:text-cyan-400 p-2 rounded-lg hover:bg-slate-900 transition-colors shrink-0"
                                        title="Visit Campaign Website"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}