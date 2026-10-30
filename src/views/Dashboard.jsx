import { useState } from 'react';
import { HeroSection } from "../components/HeroSection.jsx";
import { PoliticianFilters } from "../components/PoliticianFilters.jsx";
import { PoliticianGrid } from "../components/PoliticianGrid.jsx";
import { usePoliticians } from "../hooks/usePoliticians.js";

export function DashboardView({ selectedState, setSelectedState, onSelectPolitician }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedChamber, setSelectedChamber] = useState("ALL");
    const [selectedParty, setSelectedParty] = useState("ALL");
    const [selectedStatus, setSelectedStatus] = useState("ALL");

    const {
        filteredPoliticians,
        stateSummaryStats,
        isLoading,
        hasError,
    } = usePoliticians({ selectedState, selectedChamber, searchQuery, selectedParty,selectedStatus });

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedState("ALL");
        setSelectedChamber("ALL");
        setSelectedParty("ALL");
        setSelectedStatus("ALL")
    };



    return (
        <>
            <HeroSection
                selectedState={selectedState}
                onSelectState={setSelectedState}
                stateSummaryStats={stateSummaryStats}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PoliticianFilters
                    searchQuery={searchQuery} onSearchChange={setSearchQuery}
                    selectedState={selectedState} onStateChange={setSelectedState}
                    selectedChamber={selectedChamber} onChamberChange={setSelectedChamber}
                    selectedParty={selectedParty} onPartyChange={setSelectedParty}
                    politicians={filteredPoliticians}
                    selectedStatus={selectedStatus} onStatusChange={setSelectedStatus}
                />

                <PoliticianGrid
                    politicians={filteredPoliticians}
                    selectedState={selectedState}
                    isLoading={isLoading}
                    hasError={hasError}
                    onSelect={onSelectPolitician}
                    onResetFilters={resetFilters}
                />
            </main>
        </>
    );
}