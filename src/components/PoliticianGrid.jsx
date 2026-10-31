import React from 'react';
import { AlertCircle, MapPin, RefreshCw, User, Search } from 'lucide-react';
import { PoliticianCard } from "./PoliticianCard.jsx";

function StatusPanel({ icon: Icon, iconClass = "text-slate-500", message, children }) {
    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
            <Icon className={`w-10 h-10 mx-auto mb-3 ${iconClass}`} />
            <p className="text-slate-400 font-medium">{message}</p>
            {children}
        </div>
    );
}

export function PoliticianGrid({
                                   politicians = [],
                                   selectedState,
                                   searchQuery = "",
                                   isLoading,
                                   hasError,
                                   onSelect,
                                   onResetFilters
                               }) {
    const hasActiveSearch = searchQuery.trim().length >= 2;
    const isStateSelected = Boolean(selectedState) && selectedState !== "ALL";

    let content;

    if (isLoading) {
        content = (
            <StatusPanel
                icon={RefreshCw}
                iconClass="text-slate-500 animate-spin"
                message="Loading Politicians…"
            />
        );
    } else if (hasError) {
        content = (
            <StatusPanel
                icon={AlertCircle}
                iconClass="text-rose-400"
                message="Could not load politicians. Please try again."
            />
        );
    } else if (!isStateSelected && !hasActiveSearch && politicians.length === 0) {
        // Show prompt when user hasn't selected a state AND hasn't typed a search term
        content = (
            <StatusPanel
                icon={MapPin}
                message="Search by member name above or select a state to view congressional members."
            />
        );
    } else if (politicians.length === 0) {
        // Show no results when searching or filtering returned 0 records
        content = (
            <StatusPanel
                icon={hasActiveSearch ? Search : AlertCircle}
                message={
                    hasActiveSearch
                        ? `No congressional members found matching "${searchQuery}".`
                        : "No congressional members found matching these filters."
                }
            >
                <button
                    onClick={onResetFilters}
                    className="mt-4 text-xs font-semibold text-cyan-400 hover:underline"
                >
                    Reset All Filters
                </button>
            </StatusPanel>
        );
    } else {
        content = (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {politicians.map((p) => (
                    <PoliticianCard key={p.id} politician={p} onSelect={onSelect} />
                ))}
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
                    <User className="w-5 h-5 text-cyan-400" />
                    <span>Politicians ({politicians.length})</span>
                </h2>
            </div>
            {content}
        </div>
    );
}