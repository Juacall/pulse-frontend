import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from "./components/Header.jsx";
import { DashboardView } from "./views/Dashboard.jsx";
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
    const { user, simulateVerifyIdentity } = useAuth();

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
                                        onSelectPolitician={setSelectedPolitician}
                                    />
                                }
                            />
                            <Route path="/about" element={<About />} />
                            <Route
                                path="*"
                                element={
                                    <DashboardView
                                        selectedState={selectedState}
                                        setSelectedState={setSelectedState}
                                        onSelectPolitician={setSelectedPolitician}
                                    />
                                }
                            />
                        </Routes>
                    </div>

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
            </BrowserRouter>
        </ToastProvider>
    );
}