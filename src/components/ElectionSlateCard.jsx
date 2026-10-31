import React from 'react';
import { UserCheck, ExternalLink } from 'lucide-react';

export function ElectionSlateCard({ race }) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
            {/* Race Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-100">
                    {race.office === 'Senate' ? 'U.S. Senate' : `U.S. House - District ${race.district}`}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                    {race.candidates.length} Contenders
                </span>
            </div>

            {/* Candidate Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {race.candidates.map((candidate) => (
                    <div
                        key={candidate.politician_id}
                        className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="font-semibold text-slate-200 text-sm">{candidate.name}</span>
                                {candidate.is_incumbent && (
                                    <span className="flex items-center text-[10px] bg-amber-950/80 text-amber-400 border border-amber-800/60 px-1.5 py-0.5 rounded">
                                        <UserCheck className="w-3 h-3 mr-1" /> Incumbent
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex items-center space-x-3">
                                <span className={candidate.party === 'Democratic' ? 'text-blue-400' : 'text-red-400'}>
                                    {candidate.party}
                                </span>
                                <span>•</span>
                                <span>Raised: ${candidate.total_receipts.toLocaleString()}</span>
                            </div>
                        </div>

                        {candidate.campaign_url && (
                            <a
                                href={candidate.campaign_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-cyan-400 p-2 transition-colors"
                                title="Campaign Website"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}