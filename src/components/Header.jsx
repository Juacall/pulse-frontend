import React from 'react';
import { Sparkles, User, UserCheck } from 'lucide-react';
import { useAuthModal } from "../hooks/useAuthModal.js";
import { useAuth } from "../hooks/useAuth.js";

export function Header({ setIsAiModalOpen, onOpenAccount }) {
    const { user } = useAuth();
    const { openAuthModal } = useAuthModal();

    const handleAiConsoleClick = () => {
        if (!user) {
            // Intercept unauthenticated click and trigger auth modal
            openAuthModal('login');
            return;
        }
        // Open AI Console for authenticated users
        setIsAiModalOpen(true);
    };

    const handleAccountClick = () => {
        if (user) {
            // User is logged in -> Open Account Drawer
            onOpenAccount();
        } else {
            // Guest user -> Open Auth Modal
            openAuthModal('login');
        }
    };

    return (
        <header className="w-full bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
            {/* Left Side: App Brand / Logo */}
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                    P
                </div>
                <h1 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                    Pulse
                </h1>
            </div>

            {/* Right Side: Button Group */}
            <div className="flex items-center space-x-3 ml-auto">
                {/* Protected AI Console Trigger */}
                <button
                    onClick={handleAiConsoleClick}
                    className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-cyan-900/20 transition-all border border-cyan-400/30"
                >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                    <span>AI Search</span>
                </button>

                {/* Dynamic Auth / Account Button */}
                {user ? (
                    <button
                        onClick={handleAccountClick}
                        className="flex items-center space-x-2 bg-cyan-950/60 hover:bg-cyan-900/50 text-cyan-300 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-cyan-800/80 transition-colors"
                    >
                        <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Account</span>
                    </button>
                ) : (
                    <button
                        onClick={() => openAuthModal('login')}
                        className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-700/80 transition-colors"
                    >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sign In</span>
                    </button>
                )}
            </div>
        </header>
    );
}