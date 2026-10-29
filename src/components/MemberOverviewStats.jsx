import React from 'react';
import { FileText, CheckCircle2, Award, DollarSign, Calendar, ShieldAlert } from 'lucide-react';

export function MemberOverviewStats({ politician }) {
    const isIncumbent =
        politician?.isIncumbent === true ||
        politician?.is_incumbent === true ||
        String(politician?.status).toLowerCase() === 'incumbent';

    // Support flexible property keying from backend payloads
    const partyLoyalty = politician?.votesWithParty ?? politician?.partyLoyaltyRate ?? politician?.party_loyalty_pct;

    // Format total receipts / campaign funding
    const formatCurrency = (val) => {
        if (val == null || isNaN(val)) return '$0';
        if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
        if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
        return `$${val.toLocaleString()}`;
    };

    const totalRaised = politician?.totalRaised ?? politician?.totalReceipts ?? politician?.finance_summary?.total_receipts ?? 0;

    const getLaunchYear = (dateStr) => {
        const targetDate = dateStr || politician?.firstFileDate;
        if (!targetDate) return politician?.launch_year || 'N/A';
        const parsed = new Date(targetDate);
        return isNaN(parsed.getFullYear()) ? 'N/A' : parsed.getFullYear();
    };



    return (
        <div className="mb-6">
            {/* Top Overview 3-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {isIncumbent ? (
                    /* Incumbent Overview Stats */
                    <>
                        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                                    Bills Sponsored
                                </span>
                                <span className="text-sm font-bold text-slate-200">
                                    {politician?.metrics?.sponsoredCount ?? politician?.sponsoredCount ?? 0}
                                </span>
                            </div>
                        </div>

                        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                                    Legislative Pass Rate
                                </span>
                                <span className="text-sm font-bold text-emerald-400">
                                    {politician?.passRate == null && politician?.metrics?.passRate == null
                                        ? 'N/A'
                                        : `${politician?.passRate ?? politician?.metrics?.passRate}%`}
                                </span>
                            </div>
                        </div>

                        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                                    Party Loyalty Rate
                                </span>
                                <span className="text-sm font-bold text-slate-200">
                                    {partyLoyalty != null ? `${partyLoyalty}%` : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Challenger Overview Stats */
                    <>
                        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                                    Total Campaign Raised
                                </span>
                                <span className="text-sm font-bold text-cyan-400">
                                    {formatCurrency(totalRaised)}
                                </span>
                            </div>
                        </div>

                        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                                    Campaign Launched
                                </span>
                                <span className="text-sm font-bold text-slate-200">
                                    Since {getLaunchYear(politician?.launchDate)}
                                </span>
                            </div>
                        </div>

                        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                                    Candidate Status
                                </span>
                                <span className="text-sm font-bold text-amber-300">
                                    Challenger
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Contextual Party Unity Visual Breakdown for Incumbents */}
            {isIncumbent && partyLoyalty != null && (
                <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-3.5 mt-3">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-indigo-400" />
                            Party Alignment Breakdown
                        </span>
                        <span className="text-xs font-bold text-indigo-400">
                            {partyLoyalty}% Alignment
                        </span>
                    </div>

                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                        <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, partyLoyalty))}%` }}
                        />
                    </div>

                    <p className="text-[10px] text-slate-500 leading-normal">
                        Measures the percentage of contested party-unity roll calls where {politician?.name || 'this member'} aligned with the majority stance of the {politician?.party || ''} party.
                    </p>
                </div>
            )}
        </div>
    );
}