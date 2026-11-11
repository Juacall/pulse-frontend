import React, { useEffect, useState } from 'react';

export const SuperPacImpactCard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        const fetchImpactData = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE_URL}/api/analytics/super-pacs/impact?cycle=2026&limit=25`);
                if (!res.ok) {
                    throw new Error(`Failed to load Super PAC data (${res.status})`);
                }
                const json = await res.json();
                setData(json);
            } catch (err) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchImpactData();
    }, []);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(amount);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12 text-slate-400 font-mono">
                Loading Super PAC & Independent Spending Data...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                    Super PAC Independent Spending & Impact
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                    2025–2026 Cycle • Outside Expenditures Advocating For or Against Candidates
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm text-slate-300">
                    <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                        <th className="py-3 px-4">Super PAC / Entity</th>
                        <th className="py-3 px-4">Support vs. Oppose Ratio</th>
                        <th className="py-3 px-4 text-right">Total Outside Spending</th>
                        <th className="py-3 px-4 text-center">Races Targeted</th>
                        <th className="py-3 px-4 text-right">Top Recipient / Target</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                    {data?.super_pacs.map((pac, idx) => {
                        const total = pac.total_independent_expenditures || 1;
                        const supportPct = Math.round((pac.total_support_spending / total) * 100);
                        const opposePct = 100 - supportPct;

                        return (
                            <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                                <td className="py-4 px-4 font-semibold text-white">
                                    {pac.super_pac_name}
                                </td>
                                <td className="py-4 px-4 w-64">
                                    <div className="flex justify-between text-xs font-mono mb-1">
                                        <span className="text-emerald-400">{supportPct}% Support</span>
                                        <span className="text-rose-400">{opposePct}% Oppose</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                                        <div
                                            className="bg-emerald-500 h-full"
                                            style={{ width: `${supportPct}%` }}
                                            title={`Support: ${formatCurrency(pac.total_support_spending)}`}
                                        />
                                        <div
                                            className="bg-rose-500 h-full"
                                            style={{ width: `${opposePct}%` }}
                                            title={`Oppose: ${formatCurrency(pac.total_oppose_spending)}`}
                                        />
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right font-mono text-cyan-400 font-semibold">
                                    {formatCurrency(pac.total_independent_expenditures)}
                                </td>
                                <td className="py-4 px-4 text-center font-mono">
                                    {pac.candidates_targeted}
                                </td>
                                <td className="py-4 px-4 text-right">
                                    {pac.top_target_candidate ? (
                                        <div>
                                            <div className="text-slate-200 font-medium">
                                                {pac.top_target_candidate}
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono">
                                                {formatCurrency(pac.top_target_amount || 0)}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-slate-600">—</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};