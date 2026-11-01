import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

// All 50 US State Postal Abbreviations
const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function AnalyticsPage() {
    const [nationalSummary, setNationalSummary] = useState(null);
    const [stateData, setStateData] = useState([]);
    const [incumbentData, setIncumbentData] = useState([]);

    // State Drilldown States
    const [selectedState, setSelectedState] = useState('WA');
    const [stateIncumbentData, setStateIncumbentData] = useState([]);
    const [stateIncumbentLoading, setStateIncumbentLoading] = useState(false);

    // Global Initial Page Loading
    const [pageLoading, setPageLoading] = useState(true);

    // 1. Initial Load for Page-Level Data (Runs Once On Mount)
    useEffect(() => {
        async function fetchPageAnalytics() {
            try {
                setPageLoading(true);
                const [natRes, stateRes, incRes] = await Promise.all([
                    fetch('/api/analytics/donations/national-summary').then(res => res.json()),
                    fetch('/api/analytics/donations/by-state?limit=15').then(res => res.json()),
                    fetch('/api/analytics/donations/incumbent-vs-challenger').then(res => res.json())
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

    // 2. Isolated Load for State Drilldown (Runs On State Change Without Reloading Full Page)
    useEffect(() => {
        async function fetchStateIncumbentData() {
            try {
                setStateIncumbentLoading(true);
                const res = await fetch(`/api/analytics/donations/by-state/${selectedState}/incumbent-vs-challenger`);
                if (res.ok) {
                    const data = await res.json();
                    setStateIncumbentData(data);
                }
            } catch (error) {
                console.error(`Failed to fetch incumbent breakdown for state ${selectedState}:`, error);
            } finally {
                setStateIncumbentLoading(false);
            }
        }

        fetchStateIncumbentData();
    }, [selectedState]);

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

            {/* HEADER */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Campaign Finance Analytics</h1>
                <p className="text-slate-400 mt-1">Macro insights across OpenFEC summary metrics and donor profiles.</p>
            </div>

            {/* SECTION 1: MACRO KPI CARDS */}
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

            {/* SECTION 2: DONOR COMPOSITION & INCUMBENT VS CHALLENGER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* National Composition Pie Chart */}
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

                {/* National Incumbents vs Challengers */}
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

            {/* SECTION 3: BY-STATE STACKED BAR COMPARISON */}
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

            {/* SECTION 4: STATE-SPECIFIC DRILLDOWN */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                        State Drilldown: Incumbent Parity {stateIncumbentLoading && <span className="text-xs text-slate-500 font-mono ml-2">(Updating...)</span>}
                    </h2>
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-white px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        {US_STATES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                        ))}
                    </select>
                </div>

                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stateIncumbentData}>
                            <XAxis dataKey="category" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" tickFormatter={(val) => `$${(val / 1e6).toFixed(1)}M`} />
                            <Tooltip formatter={(val) => `$${(val / 1e6).toFixed(2)}M`} />
                            <Legend />
                            <Bar dataKey="total_grassroots_dollars" name="Grassroots" fill="#10b981" />
                            <Bar dataKey="total_large_donor_dollars" name="Large Donors" fill="#3b82f6" />
                            <Bar dataKey="total_pac_dollars" name="PACs" fill="#f59e0b" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
}