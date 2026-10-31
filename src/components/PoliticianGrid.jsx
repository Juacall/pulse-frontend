import React, { useState, useEffect } from 'react';
import { AlertCircle, MapPin, RefreshCw, User, Search, Vote, Users } from 'lucide-react';
import { PoliticianCard } from "./PoliticianCard.jsx";
import { StateElectionsGrid } from "./StateElectionsGrid.jsx";

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
    const [viewMode, setViewMode] = useState('politicians'); // 'politicians' | 'elections'
    const [electionData, setElectionData] = useState(null);
    const [isLoadingElections, setIsLoadingElections] = useState(false);
    const [electionsError, setElectionsError] = useState(null);

    const hasActiveSearch = searchQuery.trim().length >= 2;
    const isStateSelected = Boolean(selectedState) && selectedState.toUpperCase() !== "ALL";

    // -------------------------------------------------------------------
    // API Call: Fetch Election Slates when State or View Changes
    // -------------------------------------------------------------------
    useEffect(() => {
        let isMounted = true;

        const fetchStateElections = async () => {
            if (!isStateSelected || viewMode !== 'elections') return;

            setIsLoadingElections(true);
            try {
                const res = await fetch(`/api/elections/state?state_code=${selectedState}&cycle=2026`);
                const data = await res.json();

                // Only update state if component is still active
                if (isMounted) setElectionData(data);
            } catch (err) {
                if (isMounted) setElectionsError(err.message);
            } finally {
                if (isMounted) setIsLoadingElections(false);
            }
        };

        fetchStateElections();

        return () => {
            isMounted = false; // Cleanup flag
        };
    }, [selectedState, viewMode, isStateSelected]);

    // Calculate total candidate contenders across election slates for header label
    const totalElectionCandidates = electionData?.races?.reduce(
        (sum, race) => sum + (race.candidates?.length || 0), 0
    ) || electionData?.candidates?.length || 0;

    const toggleViewMode = () => {
        setViewMode((prev) => (prev === 'politicians' ? 'elections' : 'politicians'));
    };

    let content;

    if (viewMode === 'elections') {
        if (!isStateSelected) {
            content = (
                <StatusPanel
                    icon={MapPin}
                    iconClass="text-cyan-400"
                    message="Please select a specific state from the dropdown to view upcoming election slates."
                />
            );
        } else {
            content = (
                <StateElectionsGrid
                    selectedState={selectedState}
                    data={electionData}
                    loading={isLoadingElections}
                    error={electionsError}
                />
            );
        }
    } else {
        // Standard Politicians Directory View
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
            content = (
                <StatusPanel
                    icon={MapPin}
                    message="Search by member name above or select a state to view congressional members."
                />
            );
        } else if (politicians.length === 0) {
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
    }

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                {/* Dynamic Title Label */}
                <h2 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
                    {viewMode === 'politicians' ? (
                        <>
                            <User className="w-5 h-5 text-cyan-400" />
                            <span>Politicians ({politicians.length})</span>
                        </>
                    ) : (
                        <>
                            <Vote className="w-5 h-5 text-cyan-400" />
                            <span>Elections ({isStateSelected ? totalElectionCandidates : 0})</span>
                        </>
                    )}
                </h2>

                {/* View Switcher Button */}
                <button
                    onClick={toggleViewMode}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-800/60 transition-colors shadow-sm"
                >
                    {viewMode === 'politicians' ? (
                        <>
                            <Vote className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Show Elections</span>
                        </>
                    ) : (
                        <>
                            <Users className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Show Politicians</span>
                        </>
                    )}
                </button>
            </div>
            {content}
        </div>
    );
}