// src/components/LegislativeTrackRecordTab.jsx
import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { FileText, Users, Award, ShieldCheck, AlertCircle } from 'lucide-react';

export function LegislativeTrackRecordTab({ politicianId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchTrackRecord() {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`/api/analytics/legislative/track-record/${politicianId}`);
                if (!res.ok) {
                    throw new Error(`Failed to fetch legislative track record (${res.status})`);
                }
                const json = await res.json();
                if (isMounted) {
                    setData(json);
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Error loading legislative metrics:", err);
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        if (politicianId) {
            fetchTrackRecord();
        }
        return () => { isMounted = false; };
    }, [politicianId]);

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-400 font-mono text-sm animate-pulse">
                Loading legislative performance metrics...
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">Legislative data currently unavailable</p>
                <p className="text-xs text-slate-500 mt-1">Check back once congressional records finish syncing for this member.</p>
            </div>
        );
    }

    const sponsorFunnel = data.funnel?.find(f => f.relationship === 'sponsor') || {
        total_bills: 0,
        introduced: 0,
        in_committee: 0,
        passed_chamber: 0,
        enacted: 0
    };

    return (
        <div className="space-y-6">
            {/* 1. Scorecard Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bipartisanship Score */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between min-w-0">
                    <div className="min-w-0 pr-3 flex-1">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span className="truncate">Cross-Party Sponsorship</span>
                        </div>
                        {/* Removed truncate so long text wraps cleanly across lines */}
                        <p className="text-xs text-slate-500 leading-normal">
                            Sponsored bills with opposing party co-sponsors
                        </p>
                    </div>
                    <div className="text-2xl font-black text-cyan-400 font-mono shrink-0 pl-1">
                        {Number(data.bipartisanship?.bipartisanship_score || 0).toFixed(1)}%
                    </div>
                </div>

                {/* Total Sponsored Legislation */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            <FileText className="w-4 h-4 text-emerald-400" />
                            <span>Primary Bills Sponsored</span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Total authored bills introduced in current cycle
                        </p>
                    </div>
                    <div className="text-2xl font-black text-emerald-400">
                        {data.bipartisanship?.total_sponsored_bills ?? 0}
                    </div>
                </div>
            </div>

            {/* 2. Bill Advancement Funnel */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Primary Bill Advancement Funnel</span>
                </h4>

                <div className="space-y-3">
                    <FunnelStageBar
                        label="Introduced"
                        count={sponsorFunnel.introduced}
                        total={sponsorFunnel.total_bills}
                        color="bg-slate-600"
                    />
                    <FunnelStageBar
                        label="In Committee"
                        count={sponsorFunnel.in_committee}
                        total={sponsorFunnel.total_bills}
                        color="bg-blue-500"
                    />
                    <FunnelStageBar
                        label="Passed Chamber"
                        count={sponsorFunnel.passed_chamber}
                        total={sponsorFunnel.total_bills}
                        color="bg-amber-500"
                    />
                    <FunnelStageBar
                        label="Enacted into Law"
                        count={sponsorFunnel.enacted}
                        total={sponsorFunnel.total_bills}
                        color="bg-emerald-500"
                    />
                </div>
            </div>

            {/* 3. Top Policy Focus Areas */}
            {data.policy_focus && data.policy_focus.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                    <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        <span>Top Policy Focus Areas</span>
                    </h4>

                    <div className="h-60 w-full min-h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={data.policy_focus} margin={{ left: 10, right: 20 }}>
                                <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `${v}%`} />
                                <YAxis dataKey="policy_area" type="category" stroke="#94a3b8" width={120} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(val) => [`${val}%`, 'Policy Share']} />
                                <Bar dataKey="percentage" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                                    {data.policy_focus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#06b6d4' : '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}

// Progress bar helper for stages
function FunnelStageBar({ label, count, total, color }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">{label}</span>
                <span className="text-slate-400 font-mono">{count} bill{count !== 1 ? 's' : ''} ({pct}%)</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}