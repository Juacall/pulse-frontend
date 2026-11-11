import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { TopDonorsLeaderboard } from '../components/TopDonorsLeaderboard';
import { SuperPacImpactDrilldown } from '../components/SuperPacImpactDrilldown';
import { StateFinanceDrilldown } from '../components/StateFinanceDrilldown';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState('donors'); // 'donors' | 'charts' | 'state_drilldown'
    const [donorSubTab, setDonorSubTab] = useState('direct'); // 'direct' | 'super_pacs'

    const [nationalSummary, setNationalSummary] = useState(null);
    const [stateData, setStateData] = useState([]);
    const [incumbentData, setIncumbentData] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);

    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

    // Initial Load for Macro Analytics
    useEffect(() => {
        async function fetchPageAnalytics() {
            try {
                setPageLoading(true);
                const [natRes, stateRes, incRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/analytics/donations/national-summary`).then(res => res.json()),
                    fetch(`${API_BASE_URL}/api/analytics/donations/by-state?limit=15`).then(res => res.json()),
                    fetch(`${API_BASE_URL}/api/analytics/donations/incumbent-vs-challenger`).then(res => res.json())
                ]);

                setNationalSummary(natRes);
                setStateData(stateRes);
                setIncumbentData(incRes);
            } catch (error) {
                console.error('Failed to load national analytics data:', error);
            } finally {
                setPageLoading(false);
            }
        }

        fetchPageAnalytics();
    }, []);

    if (pageLoading) {
        return <div className="p-8 text-slate-200 font-mono">Loading campaign finance analytics...</div>;
    }

    const pieData = nationalSummary ? [
        { name: 'Grassroots (≤ $200)', value: nationalSummary.total_grassroots_dollars },
        { name: 'Large Individual (> $200)', value: nationalSummary.total_large_donor_dollars },
        { name: 'PAC Contributions', value: nationalSummary.total_pac_dollars }
    ] : [];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-8">

            {/* HEADER & MAIN PAGE TABS */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Campaign Finance Analytics</h1>
                    <p className="text-slate-400 mt-1">Macro insights, donor rankings, and outside spending drill-downs.</p>
                </div>

                {/* PRIMARY NAVIGATION TABS */}
                <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl self-start md:self-auto">
                    <button
                        onClick={() => setActiveTab('donors')}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                            activeTab === 'donors'
                                ? 'bg-cyan-500 text-slate-950 shadow-md'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                    >
                        Top Donors & Super PACs
                    </button>
                    <button
                        onClick={() => setActiveTab('state_drilldown')}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                            activeTab === 'state_drilldown'
                                ? 'bg-cyan-500 text-slate-950 shadow-md'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                    >
                        State Drill-Down
                    </button>
                    <button
                        onClick={() => setActiveTab('charts')}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                            activeTab === 'charts'
                                ? 'bg-cyan-500 text-slate-950 shadow-md'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                    >
                        Macro Overview & Charts
                    </button>
                </div>
            </div>

            {/* MACRO KPI CARDS (Always Visible) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Raised</p>
                    <p className="text-2xl font-bold mt-1 text-white">
                        ${((nationalSummary?.total_receipts_dollars || 0) / 1e9).toFixed(2)}B
                    </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Total Grassroots ({"<="} $200)</p>
                    <p className="text-2xl font-bold mt-1 text-emerald-400">
                        ${((nationalSummary?.total_grassroots_dollars || 0) / 1e9).toFixed(2)}B
                    </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">Large Individual ({">"} $200)</p>
                    <p className="text-2xl font-bold mt-1 text-blue-400">
                        ${((nationalSummary?.total_large_donor_dollars || 0) / 1e9).toFixed(2)}B
                    </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <p className="text-xs text-amber-400 font-medium uppercase tracking-wider">National Grassroots Share</p>
                    <p className="text-2xl font-bold mt-1 text-amber-400">
                        {nationalSummary?.national_grassroots_pct || 0}%
                    </p>
                </div>
            </div>

            {/* TAB 1: TOP DONORS & SUPER PACS */}
            {activeTab === 'donors' && (
                <div className="space-y-6">
                    {/* SUB-TAB CONTROL */}
                    <div className="flex border-b border-slate-800 space-x-6">
                        <button
                            onClick={() => setDonorSubTab('direct')}
                            className={`pb-3 text-sm font-semibold transition-all relative ${
                                donorSubTab === 'direct'
                                    ? 'text-cyan-400 border-b-2 border-cyan-500'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Direct Candidate Contributions (PACs & Orgs)
                        </button>
                        <button
                            onClick={() => setDonorSubTab('super_pacs')}
                            className={`pb-3 text-sm font-semibold transition-all relative ${
                                donorSubTab === 'super_pacs'
                                    ? 'text-cyan-400 border-b-2 border-cyan-500'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Super PAC Outside Spending Drill-Down
                        </button>
                    </div>

                    {/* SUB-TAB CONTENT */}
                    {donorSubTab === 'direct' ? (
                        <TopDonorsLeaderboard />
                    ) : (
                        <SuperPacImpactDrilldown />
                    )}
                </div>
            )}

            {/* TAB 2: STATE DRILL-DOWN */}
            {activeTab === 'state_drilldown' && (
                <div className="space-y-6">
                    <StateFinanceDrilldown />
                </div>
            )}

            {/* TAB 3: MACRO CHARTS & OVERVIEW */}
            {activeTab === 'charts' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Donor Composition */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4">National Donor Composition</h2>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={90}
                                            innerRadius={50}
                                            paddingAngle={4}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `$${(value / 1e6).toFixed(1)}M`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Incumbents vs Challengers */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4">Incumbents vs. Challengers (National)</h2>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={incumbentData}>
                                        <XAxis dataKey="category" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" tickFormatter={(val) => `$${(val / 1e6).toFixed(0)}M`} />
                                        <Tooltip formatter={(val) => `$${(val / 1e6).toFixed(1)}M`} />
                                        <Legend />
                                        <Bar dataKey="total_grassroots_dollars" name="Grassroots" fill="#10b981" stackId="a" />
                                        <Bar dataKey="total_large_donor_dollars" name="Large Individual" fill="#3b82f6" stackId="a" />
                                        <Bar dataKey="total_pac_dollars" name="PACs" fill="#f59e0b" stackId="a" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Top 15 States Bar Chart */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4">Top 15 States by Total Campaign Receipts</h2>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stateData}>
                                    <XAxis dataKey="state" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" tickFormatter={(val) => `$${(val / 1e6).toFixed(0)}M`} />
                                    <Tooltip formatter={(val) => `$${(val / 1e6).toFixed(1)}M`} />
                                    <Legend />
                                    <Bar dataKey="total_grassroots_dollars" name="Grassroots (<= $200)" fill="#10b981" stackId="a" />
                                    <Bar dataKey="total_large_donor_dollars" name="Large Individual (> $200)" fill="#3b82f6" stackId="a" />
                                    <Bar dataKey="total_pac_dollars" name="PACs" fill="#f59e0b" stackId="a" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}