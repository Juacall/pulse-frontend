import React, { useMemo } from 'react';
import { Search } from 'lucide-react';
import { STATE_OPTIONS } from "../constants/states";

export function PoliticianFilters({
                                      searchQuery, onSearchChange,
                                      selectedState, onStateChange,
                                      selectedChamber, onChamberChange,
                                      selectedStatus, onStatusChange,
                                      selectedParty, onPartyChange,
                                      politicians = [],
                                  }) {

    const partyOptions = useMemo(() => {
        const parties = new Set(
            politicians
                .map((p) => p.party)
                .filter((party) => Boolean(party) && party.trim() !== '')
        );
        return Array.from(parties).sort();
    }, [politicians]);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">

                {/* Search Input */}
                <div className="md:col-span-4 relative">
                    <Search className="w-5 h-5 absolute left-3.5 top-2.5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search politicians or candidates..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                </div>

                {/* State Select */}
                <div className="md:col-span-2">
                    <select
                        value={selectedState}
                        onChange={(e) => onStateChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
                    >
                        <option value="ALL">All States</option>
                        {STATE_OPTIONS.map(([code, name]) => (
                            <option key={code} value={code}>{code} - {name}</option>
                        ))}
                    </select>
                </div>

                {/* Chamber Select */}
                <div className="md:col-span-2">
                    <select
                        value={selectedChamber}
                        onChange={(e) => onChamberChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
                    >
                        <option value="ALL">All Chambers</option>
                        <option value="House">House</option>
                        <option value="Senate">Senate</option>
                    </select>
                </div>

                {/* Candidate Status Select */}
                <div className="md:col-span-2">
                    <select
                        value={selectedStatus}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="Incumbent">Incumbents</option>
                        <option value="Challenger">Challengers</option>
                    </select>
                </div>

                {/* Party Select */}
                <div className="md:col-span-2">
                    <select
                        value={selectedParty}
                        onChange={(e) => onPartyChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
                    >
                        <option value="ALL">All Parties</option>
                        {partyOptions.map((party) => (
                            <option key={party} value={party}>
                                {party}
                            </option>
                        ))}
                    </select>
                </div>

            </div>
        </div>
    );
}