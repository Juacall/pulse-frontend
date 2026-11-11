import React, { useState, useEffect } from 'react';

export const SuperPacImpactDrilldown = () => {
    const [impactData, setImpactData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Selected Super PAC for modal or inline drilldown
    const [selectedPac, setSelectedPac] = useState(null);
    const [pacDetailLoading, setPacDetailLoading] = useState(false);
    const [pacTargets, setPacTargets] = useState([]);

    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        const fetchImpactSummary = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE_URL}/api/analytics/super-pacs/impact?cycle=2026&limit=25`);
                if (!res.ok) throw new Error(`Failed to load Super PAC data (${res.status})`);
                const json = await res.json();
                setImpactData(json.super_pacs || []);
            } catch (err) {
                setError(err.message || 'An error occurred fetching Super PAC data.');
            } finally {
                setLoading(false);
            }
        };

        fetchImpactSummary();
    }, []);

    // Fetch individual candidates targeted by a specific Super PAC
    const handleSelectPac = async (pac) => {
        if (selectedPac?.super_pac_name === pac.super_pac_name) {
            setSelectedPac(null); // Toggle close
            return;
        }

        try {
            setSelectedPac(pac);
            setPacDetailLoading(true);
            const encodedName = encodeURIComponent(pac.super_pac_name);
            const res = await fetch(`${API_BASE_URL}/api/analytics/super-pacs/${encodedName}/targets?cycle=2026`);
            if (res.ok) {
                const json = await res.json();
                setPacTargets(json.targets || []);
            } else {
                setPacTargets([]);
            }
        } catch (err) {
            console.error('Failed to load candidate target details:', err);
            setPacTargets([]);
        } finally {
            setPacDetailLoading(false);
        }
    };

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

    if (loading) return <div className="p-8 text-slate-400 font-mono text-center">Loading Super PAC Impact Data...</div>;
    if (error) return <div className="p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg">{error}</div>;

    return (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Super PAC Outside Spending Drill-Down</h2>
                <p className="text-sm text-slate-400 mt-1">
                    Click any Super PAC to view their itemized spending per target candidate.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm text-slate-300">
                    <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                        <th className="py-3 px-4">Super PAC / Entity</th>
                        <th className="py-3 px-4">Support vs. Oppose Breakdown</th>
                        <th className="py-3 px-4 text-right">Total Outside Spending</th>
                        <th className="py-3 px-4 text-center">Races Targeted</th>
                        <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                    {impactData.map((pac, idx) => {
                        const total = pac.total_independent_expenditures || 1;
                        const supportPct = Math.round((pac.total_support_spending / total) * 100);
                        const opposePct = 100 - supportPct;
                        const isSelected = selectedPac?.super_pac_name === pac.super_pac_name;

                        return (
                            <React.Fragment key={idx}>
                                <tr
                                    onClick={() => handleSelectPac(pac)}
                                    className={`cursor-pointer transition-colors ${
                                        isSelected ? 'bg-slate-800/80 border-l-4 border-cyan-500' : 'hover:bg-slate-800/40'
                                    }`}
                                >
                                    <td className="py-4 px-4 font-semibold text-white">
                                        {pac.super_pac_name}
                                    </td>
                                    <td className="py-4 px-4 w-64">
                                        <div className="flex justify-between text-xs font-mono mb-1">
                                            <span className="text-emerald-400">{supportPct}% Support</span>
                                            <span className="text-rose-400">{opposePct}% Oppose</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                                            <div
                                                className="bg-emerald-500 h-full transition-all"
                                                style={{ width: `${supportPct}%` }}
                                                title={`Support: ${formatCurrency(pac.total_support_spending)}`}
                                            />
                                            <div
                                                className="bg-rose-500 h-full transition-all"
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
                                    <td className="py-4 px-4 text-center">
                      <span className="text-xs text-cyan-400 hover:underline">
                        {isSelected ? 'Hide Details ▲' : 'View Targets ▼'}
                      </span>
                                    </td>
                                </tr>

                                {/* INLINE EXPANDABLE DRILLDOWN ROW */}
                                {isSelected && (
                                    <tr className="bg-slate-950/70 border-b border-slate-800">
                                        <td colSpan={5} className="p-4">
                                            <div className="p-4 bg-slate-900/90 rounded-lg border border-slate-800 space-y-4">
                                                <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                                                    Target Candidates for {pac.super_pac_name}
                                                </h4>

                                                {pacDetailLoading ? (
                                                    <div className="text-xs font-mono text-slate-400 py-2">Loading target candidates...</div>
                                                ) : pacTargets.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {pacTargets.map((target, tIdx) => (
                                                            <div key={tIdx} className="bg-slate-950 p-3 rounded border border-slate-800 text-xs">
                                                                <div className="flex justify-between font-semibold text-white">
                                                                    <span>{target.candidate_name}</span>
                                                                    <span className={target.stance === 'SUPPORT' ? 'text-emerald-400' : 'text-rose-400'}>
                                      {target.stance}
                                    </span>
                                                                </div>
                                                                <div className="flex justify-between mt-2 font-mono text-slate-400">
                                                                    <span>Total Spent:</span>
                                                                    <span className="text-slate-200">{formatCurrency(target.amount)}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-500 italic">No itemized target candidate records found.</div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};