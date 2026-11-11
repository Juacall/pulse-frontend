// src/pages/RecentBillsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText,
    CheckCircle2,
    Calendar,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    RefreshCw,
    AlertCircle,
    ArrowUp
} from 'lucide-react';
import { partyBadgeClass } from "../utils/party";

export function RecentBillsPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [expandedBillId, setExpandedBillId] = useState(null);

    // Pagination & Feed State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [feedType, setFeedType] = useState('introduced'); // 'introduced' | 'passed'
    const [chamberFilter, setChamberFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset list and page state when filters change
    useEffect(() => {
        setBills([]);
        setPage(1);
        setHasMore(true);
    }, [feedType, chamberFilter, debouncedSearch]);

    // Main fetch function
    const fetchBills = useCallback(async (targetPage, isInitial = false) => {
        if (isInitial) setLoading(true);
        else setLoadingMore(true);
        setError(null);

        try {
            const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
            const endpoint = feedType === 'passed' ? '/api/bills/passed' : '/api/bills/recent';

            const params = new URLSearchParams({
                per_chamber_limit: '10',
                page: targetPage.toString()
            });

            if (chamberFilter !== 'ALL') params.append('chamber', chamberFilter);
            if (debouncedSearch.trim()) params.append('q', debouncedSearch.trim());

            const res = await fetch(`${baseUrl}${endpoint}?${params.toString()}`);
            if (!res.ok) throw new Error(`Failed to load ${feedType} bills`);

            const data = await res.json();
            const newBills = data.bills || [];

            setBills(prev => targetPage === 1 ? newBills : [...prev, ...newBills]);
            setHasMore(data.has_more ?? newBills.length > 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [feedType, chamberFilter, debouncedSearch]);

    // Initial load & page changes
    useEffect(() => {
        fetchBills(page, page === 1);
    }, [page, fetchBills]);

    // Infinite Scroll Handler
    useEffect(() => {
        const handleScroll = () => {
            if (loading || loadingMore || !hasMore) return;

            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const clientHeight = document.documentElement.clientHeight;

            // Trigger fetch when user is within 300px of the bottom
            if (scrollTop + clientHeight >= scrollHeight - 300) {
                setPage(prevPage => prevPage + 1);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, loadingMore, hasMore]);

    const toggleExpand = (billId) => {
        setExpandedBillId(prev => prev === billId ? null : billId);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center space-x-2.5">
                        {feedType === 'introduced' ? (
                            <FileText className="w-7 h-7 text-cyan-400" />
                        ) : (
                            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                        )}
                        <span>Congressional Activity Monitor</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Track legislation across the U.S. House and Senate with official Congressional Research Service (CRS) summaries.
                    </p>
                </div>

                {/* Feed Switcher */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
                    <button
                        onClick={() => setFeedType('introduced')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            feedType === 'introduced'
                                ? 'bg-cyan-500 text-slate-950 shadow'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Recently Introduced
                    </button>
                    <button
                        onClick={() => setFeedType('passed')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            feedType === 'passed'
                                ? 'bg-emerald-500 text-slate-950 shadow'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Recently Passed
                    </button>
                </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                <div className="relative w-full sm:w-72">
                    <input
                        type="text"
                        placeholder="Search title, bill #, or sponsor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-3 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Chamber:</span>
                    <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                        {['ALL', 'House', 'Senate'].map(chamber => (
                            <button
                                key={chamber}
                                onClick={() => setChamberFilter(chamber)}
                                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                                    chamberFilter === chamber
                                        ? feedType === 'passed' ? 'bg-emerald-500 text-slate-950' : 'bg-cyan-500 text-slate-950'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {chamber}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Initial Loading State */}
            {loading ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                    <RefreshCw className={`w-8 h-8 animate-spin mx-auto mb-3 ${feedType === 'passed' ? 'text-emerald-400' : 'text-cyan-400'}`} />
                    <p className="text-sm font-medium text-slate-400">Loading {feedType} legislative records…</p>
                </div>
            ) : error ? (
                <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-8 text-center text-rose-300">
                    <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            ) : bills.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                    <p className="text-sm">No {feedType} {chamberFilter !== 'ALL' ? chamberFilter : ''} bills match your criteria.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bills.map((bill, idx) => {
                        const billId = bill.bill_id || `${bill.bill_number}-${idx}`;
                        const isExpanded = expandedBillId === billId;

                        return (
                            <div
                                key={billId}
                                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-md group"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                    <div className="flex items-center space-x-2">
                                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-950 border border-slate-800 text-cyan-400">
                                            {bill.bill_number}
                                        </span>

                                        {bill.bill_status && (
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                bill.bill_status === 'Became Law'
                                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                            }`}>
                                                {bill.bill_status}
                                            </span>
                                        )}

                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300">
                                            {bill.policy_area}
                                        </span>

                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {feedType === 'passed' && bill.latest_action_date
                                                ? `Passed: ${new Date(bill.latest_action_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                                : bill.introduced_date
                                                    ? `Introduced: ${new Date(bill.introduced_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                                    : 'Recent'}
                                        </span>
                                    </div>

                                    {bill.sponsor_name && (
                                        <div className="flex items-center space-x-2 text-xs text-slate-300">
                                            <span className="text-slate-500">Sponsor:</span>
                                            <span className="font-semibold text-slate-200">{bill.sponsor_name} ({bill.sponsor_state})</span>
                                            {bill.sponsor_party && (
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${partyBadgeClass(bill.sponsor_party)}`}>
                                                    {bill.sponsor_party}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug mb-2">
                                    {bill.title}
                                </h3>

                                <div className="mt-2">
                                    {bill.summary ? (
                                        <>
                                            <p className={`text-xs text-slate-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                                                {bill.summary}
                                            </p>
                                            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                                {bill.summary.length > 120 ? (
                                                    <button
                                                        onClick={() => toggleExpand(billId)}
                                                        className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1 transition-colors"
                                                    >
                                                        <span>{isExpanded ? "Collapse Summary" : "Read Full Summary"}</span>
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] text-slate-500 font-medium">Full summary shown</span>
                                                )}

                                                {bill.congress_url && (
                                                    <a
                                                        href={bill.congress_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-slate-400 hover:text-slate-200 flex items-center space-x-1 font-medium transition-colors"
                                                    >
                                                        <span>View on Congress.gov</span>
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 my-2">
                                                <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider block mb-1">
                                                    Latest Procedural Action
                                                </span>
                                                <p className="text-xs text-slate-400 leading-relaxed">
                                                    {bill.latest_action_text || "Bill introduced; pending committee assignment and CRS summary drafting."}
                                                </p>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                    CRS Summary Pending
                                                </span>

                                                {bill.congress_url && (
                                                    <a
                                                        href={bill.congress_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-slate-400 hover:text-slate-200 flex items-center space-x-1 font-medium transition-colors"
                                                    >
                                                        <span>View on Congress.gov</span>
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Infinite Scroll Spinner / End Indicator */}
                    {loadingMore && (
                        <div className="py-6 text-center">
                            <RefreshCw className={`w-6 h-6 animate-spin mx-auto ${feedType === 'passed' ? 'text-emerald-400' : 'text-cyan-400'}`} />
                            <p className="text-xs text-slate-500 mt-2">Fetching more records...</p>
                        </div>
                    )}

                    {!hasMore && bills.length > 0 && (
                        <div className="py-8 text-center text-xs text-slate-500 border-t border-slate-800/60 mt-6 flex items-center justify-center space-x-2">
                            <span>You've reached the end of recent records for this selection.</span>
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
                            >
                                <span>Back to top</span>
                                <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}