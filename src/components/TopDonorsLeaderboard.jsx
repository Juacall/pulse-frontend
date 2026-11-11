import React, { useEffect, useState } from 'react';

export const TopDonorsLeaderboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE_URL}/api/donors/leaderboard?cycle=2026&limit=50`);
                if (!res.ok) {
                    throw new Error(`Failed to load leaderboard (${res.status})`);
                }
                const json = await res.json();
                setData(json);
            } catch (err) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
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
                Loading Top Donors Leaderboard...
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        Top Organizational & PAC Donors
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        2025–2026 Election Cycle • Direct Contributions to Candidates
                    </p>
                </div>
                <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-semibold rounded-full border border-slate-700">
          {data?.total_count || 0} Donors Loaded
        </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm text-slate-300">
                    <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Organization / PAC Name</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4 text-right">Total Contributed</th>
                        <th className="py-3 px-4 text-center">Candidates Funded</th>
                        <th className="py-3 px-4 text-right">Top Recipient</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                    {data?.donors.map((donor, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 text-slate-500 font-mono">
                                #{idx + 1}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-white">
                                {donor.donor_name}
                            </td>
                            <td className="py-3.5 px-4">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                    {donor.donor_type || 'PAC'}
                  </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-semibold">
                                {formatCurrency(donor.total_amount_contributed)}
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono">
                                {donor.politicians_funded}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                                {donor.top_recipient_name ? (
                                    <div>
                                        <div className="text-slate-200 font-medium">
                                            {donor.top_recipient_name}
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono">
                                            {formatCurrency(donor.top_recipient_amount || 0)}
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-slate-600">—</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};