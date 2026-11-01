import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from "./components/Header.jsx";
import { DashboardView } from "./views/Dashboard.jsx";
import { AnalyticsPage } from "./pages/Analytics.jsx";
import { About } from "./pages/About.jsx";
import { AiConsoleModal } from "./components/AiConsoleModal.jsx";
import { PoliticianDetailDrawer } from "./components/PoliticianDetailDrawer.jsx";
import { AccountDrawer } from "./components/AccountDrawer.jsx";
import { usePoliticians } from "./hooks/usePoliticians";
import { useAiConsole } from "./hooks/useAiConsole";
import { useAuth } from "./hooks/useAuth";
import { ToastProvider } from "./context/ToastProvider.jsx";

export default function App() {
    const [selectedState, setSelectedState] = useState("ALL");
    const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

    const {
        selectedPolitician,
        setSelectedPolitician,
        handleVote,
    } = usePoliticians({ selectedState });

    const ai = useAiConsole();
    const { user} = useAuth();

    // In PoliticianGrid.jsx or MainLayout.jsx
    const handleSelectPolitician = async (politician) => {
        // 1. Instantly open drawer with current cached object so UI responds immediately
        console.log(1);
        setSelectedPolitician(politician);

        // 2. Fetch fresh stats in background and update selectedPolitician
        try {
            console.log(2);

            const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
            const res = await fetch(`${baseUrl}/api/votes/stats/${politician.id}`);
            if (res.ok) {
                const data = await res.json();
                if (data?.sentimentStats) {
                    console.log(data.sentimentStats);
                    // Update parent candidate state with fresh backend numbers
                    setSelectedPolitician((prev) =>
                        prev?.id === politician.id
                            ? { ...prev, sentimentStats: data.sentimentStats }
                            : prev
                    );
                }
                console.log(3);
            }
        } catch (err) {
            console.warn("Failed to fetch fresh sentiment stats:", err);
        }
    };

    return (
        <ToastProvider>
            <BrowserRouter>
                <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col">
                    <Header
                        setIsAiModalOpen={ai.setIsOpen}
                        onOpenAccount={() => setIsAccountDrawerOpen(true)}
                    />

                    <div className="flex-1">
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <DashboardView
                                        selectedState={selectedState}
                                        setSelectedState={setSelectedState}
                                        onSelectPolitician={handleSelectPolitician}
                                    />
                                }
                            />
                            <Route path="/analytics" element={<AnalyticsPage />} />
                            <Route path="/about" element={<About />} />
                            <Route
                                path="*"
                                element={
                                    <DashboardView
                                        selectedState={selectedState}
                                        setSelectedState={setSelectedState}
                                        onSelectPolitician={handleSelectPolitician}
                                    />
                                }
                            />
                        </Routes>
                    </div>

                    <PoliticianDetailDrawer
                        selectedPolitician={selectedPolitician}
                        onClose={() => setSelectedPolitician(null)}
                        user={user}
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
            </BrowserRouter>
        </ToastProvider>
    );
}