import React, { useState, useEffect } from 'react';

const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const StateFinanceDrilldown = () => {
    const [selectedState, setSelectedState] = useState('WA');
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        const fetchStateCandidates = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE_URL}/api/analytics/donations/by-state/${selectedState}/candidates`);
                if (res.ok) {
                    const json = await res.json();
                    setCandidates(json.candidates || []);
                } else {
                    setCandidates([]);
                }
            } catch (err) {
                console.error(`Failed to load candidates for ${selectedState}:`, err);
                setCandidates([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStateCandidates();
    }, [selectedState]);

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

    return (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">State Candidate Drill-Down</h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Examine individual candidate fundraising, grassroots share, and PAC backing by state.
                    </p>
                </div>

                {/* State Selector */}
                <div className="flex items-center space-x-3">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select State:</label>
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-white px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                    >
                        {US_STATES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-slate-400 font-mono text-center">Loading candidate figures for {selectedState}...</div>
            ) : candidates.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm text-slate-300">
                        <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                            <th className="py-3 px-4">Candidate Name</th>
                            <th className="py-3 px-4">Office / Incumbency</th>
                            <th className="py-3 px-4 text-right">Grassroots (≤$200)</th>
                            <th className="py-3 px-4 text-right">Large Individual</th>
                            <th className="py-3 px-4 text-right">PAC Receipts</th>
                            <th className="py-3 px-4 text-right">Total Raised</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                        {candidates.map((cand, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                                <td className="py-3.5 px-4 font-semibold text-white">
                                    {cand.name}
                                </td>
                                <td className="py-3.5 px-4 text-slate-400">
                    <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">
                      {cand.office} • {cand.incumbent_challenge_full || 'Challenger'}
                    </span>
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono text-emerald-400">
                                    {formatCurrency(cand.total_grassroots_dollars)}
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono text-blue-400">
                                    {formatCurrency(cand.total_large_donor_dollars)}
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono text-amber-400">
                                    {formatCurrency(cand.total_pac_dollars)}
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono text-white font-semibold">
                                    {formatCurrency(cand.total_receipts)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-8 text-center text-slate-500 italic border border-dashed border-slate-800 rounded-lg">
                    No detailed candidate records logged for state {selectedState}.
                </div>
            )}
        </div>
    );
};