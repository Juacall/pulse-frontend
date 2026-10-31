import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Home, Info, Heart, Sparkles, UserCheck, User } from 'lucide-react';
import {useAuth} from "../hooks/useAuth.js";
import {useAuthModal} from "../hooks/useAuthModal.js";

export function Header({ setIsAiModalOpen, onOpenAccount }) {
    const { user } = useAuth();
    const { openAuthModal } = useAuthModal();

    const handleAiConsoleClick = () => {
        if (!user) {
            openAuthModal('login');
            return;
        }
        setIsAiModalOpen(true);
    };

    const handleAccountClick = () => {
        if (user) {
            onOpenAccount();
        } else {
            openAuthModal('login');
        }
    };

    return (
        <header className="w-full max-w-full box-border bg-slate-950 border-b border-slate-800 px-3 sm:px-6 py-3 flex items-center justify-between overflow-hidden">
            {/* Left Side: Brand Logo & Navigation Links */}
            <div className="flex items-center space-x-3 sm:space-x-8 min-w-0 shrink">
                {/* Brand Logo / Home Trigger */}
                <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold group-hover:border-cyan-400 group-hover:bg-cyan-500/20 transition-all">
                        P
                    </div>
                    <span className="text-sm font-bold text-slate-100 uppercase tracking-wider group-hover:text-cyan-300 transition-colors">
                        Pulse
                    </span>
                </Link>

                {/* Navigation Links */}
                <nav className="flex items-center space-x-1">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                isActive
                                    ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/60'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                            }`
                        }
                    >
                        <Home className="w-3.5 h-3.5 shrink-0" />
                        <span className="hidden sm:inline">Home</span>
                    </NavLink>

                    <NavLink
                        to="/about"
                        className={({ isActive }) =>
                            `flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                isActive
                                    ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/60'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                            }`
                        }
                    >
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span className="hidden sm:inline">About</span>
                    </NavLink>
                </nav>
            </div>

            {/* Right Side: Action Buttons */}
            <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0 ml-2">
                {/* Styled PayPal Donate Form Button */}
                <form action="https://www.paypal.com/donate" method="post" target="_blank" className="inline-flex">
                    <input type="hidden" name="hosted_button_id" value="V2UVGX8WXNUBA" />
                    <button
                        type="submit"
                        title="Donate"
                        className="flex items-center space-x-1.5 bg-emerald-950/60 hover:bg-emerald-900/50 text-emerald-400 hover:text-emerald-300 border border-emerald-800/60 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl transition-all"
                    >
                        <Heart className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="hidden md:inline">Donate</span>
                    </button>
                </form>

                {/* Protected AI Search Trigger */}
                <button
                    onClick={handleAiConsoleClick}
                    className="flex items-center space-x-1.5 sm:space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold px-2.5 sm:px-3.5 py-2 rounded-xl shadow-lg shadow-cyan-900/20 transition-all border border-cyan-400/30"
                >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
                    <span><span className="hidden sm:inline">AI </span>Search</span>
                </button>

                {/* Account / Sign In Trigger */}
                {user ? (
                    <button
                        onClick={handleAccountClick}
                        className="flex items-center space-x-1.5 sm:space-x-2 bg-cyan-950/60 hover:bg-cyan-900/50 text-cyan-300 hover:text-white text-xs font-semibold px-2.5 sm:px-3.5 py-2 rounded-xl border border-cyan-800/80 transition-colors"
                    >
                        <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="hidden sm:inline">Account</span>
                    </button>
                ) : (
                    <button
                        onClick={() => openAuthModal('login')}
                        className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold px-2.5 sm:px-3.5 py-2 rounded-xl border border-slate-700/80 transition-colors"
                    >
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="hidden sm:inline">Sign In</span>
                    </button>
                )}
            </div>
        </header>
    );
}