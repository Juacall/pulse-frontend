import { useState } from 'react';
import { AiConsoleModal } from "./components/AiConsoleModal.jsx";
import { PoliticianDetailDrawer } from "./components/PoliticianDetailDrawer.jsx";
import { Header } from "./components/Header.jsx";
import { HeroSection } from "./components/HeroSection.jsx";
import { PoliticianFilters } from "./components/PoliticianFilters.jsx";
import { PoliticianGrid } from "./components/PoliticianGrid.jsx";
import { usePoliticians } from "./hooks/usePoliticians";
import { useAiConsole } from "./hooks/useAiConsole";
import { useAuth } from "./hooks/useAuth";
import { AccountDrawer } from "./components/AccountDrawer.jsx";
import { ToastProvider } from "./context/ToastProvider.jsx";

export default function App() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedState, setSelectedState] = useState("ALL");
    const [selectedChamber, setSelectedChamber] = useState("ALL");
    const [selectedParty, setSelectedParty] = useState("ALL");
    const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

    const {
        filteredPoliticians,
        stateSummaryStats,
        isLoading,
        hasError,
        selectedPolitician,
        setSelectedPolitician,
        handleVote,
    } = usePoliticians({ selectedState, selectedChamber, searchQuery, selectedParty });

    const ai = useAiConsole();
    const { user, simulateVerifyIdentity } = useAuth();

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedState("ALL");
        setSelectedChamber("ALL");
        setSelectedParty("ALL");
    };


    return (
        <ToastProvider>
            <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
                <Header setIsAiModalOpen={ai.setIsOpen} onOpenAccount={() => setIsAccountDrawerOpen(true)} />

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
                    />

                    <PoliticianGrid
                        politicians={filteredPoliticians}
                        selectedState={selectedState}
                        isLoading={isLoading}
                        hasError={hasError}
                        onSelect={setSelectedPolitician}
                        onResetFilters={resetFilters}
                    />
                </main>

                <PoliticianDetailDrawer
                    selectedPolitician={selectedPolitician}
                    onClose={() => setSelectedPolitician(null)}
                    user={user}
                    onVerifyIdentity={simulateVerifyIdentity}
                    onVote={handleVote}
                />

                <AiConsoleModal
                    isOpen={ai.isOpen}
                    onClose={() => ai.setIsOpen(false)}
                    onExecuteQuery={ai.executeQuery}
                    aiLoading={ai.loading}
                    aiResult={ai.result}
                />

                <AccountDrawer
                    isOpen={isAccountDrawerOpen}
                    onClose={() => setIsAccountDrawerOpen(false)}
                />
            </div>
        </ToastProvider>
    );
}