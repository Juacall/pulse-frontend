// src/components/AccountDrawer.jsx
import React, { useEffect, useState } from 'react';
import { X, User, Mail, ShieldCheck, ShieldAlert, LogOut, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function AccountDrawer({ isOpen, onClose }) {
    const { user, supabase, verifyIdentity, refreshUserSummary } = useAuth();
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('verification') === 'complete' || urlParams.get('verification') === 'success') {
            // Clear URL parameter so it doesn't re-trigger on fresh renders
            window.history.replaceState({}, document.title, window.location.pathname);

            // Trigger backend sync to update profile state across the app
            if (refreshUserSummary) {
                refreshUserSummary();
            }
        }
    }, [refreshUserSummary]);

    if (!isOpen || !user) return null;

    const metadata = user.user_metadata || {};
    const fullName = metadata.full_name || 'Constituent User';

    // Read identity verification status from top-level user or user_metadata fallback
    const isVerified = Boolean(user.is_identity_verified ?? metadata.is_identity_verified);

    // Single unified handler delegating to AuthProvider's environment-aware function
    const handleStartVerification = async () => {
        setVerifying(true);
        try {
            await verifyIdentity();
        } catch (err) {
            console.error('Failed to initiate verification:', err);
        } finally {
            setVerifying(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out">
                {/* Drawer Header */}
                <div>
                    <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Account Profile</h2>
                                <p className="text-xs text-slate-400">Constituent identity and settings</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Account Details Card */}
                    <div className="mt-6 space-y-4">
                        {/* Name Field */}
                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Full Name
                            </label>
                            <div className="flex items-center space-x-2 text-slate-200 font-semibold text-sm">
                                <User className="w-4 h-4 text-slate-400" />
                                <span>{fullName}</span>
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Email Address
                            </label>
                            <div className="flex items-center space-x-2 text-slate-200 font-semibold text-sm truncate">
                                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </div>
                        </div>

                        {/* Identity Verification Status Card */}
                        <div className={`border rounded-2xl p-4 transition-all ${
                            isVerified
                                ? 'bg-emerald-950/20 border-emerald-800/60'
                                : 'bg-amber-950/20 border-amber-800/60'
                        }`}>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Identity Status
                                </label>
                                {isVerified ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-950 border border-amber-800 px-2.5 py-0.5 rounded-full">
                                        <ShieldAlert className="w-3.5 h-3.5" /> Unverified
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                                {isVerified
                                    ? 'Your constituent identity has been confirmed via Stripe Identity. You can participate in legislative voting.'
                                    : 'Verify your constituent identity to unlock voting privileges on representative profiles.'}
                            </p>

                            {!isVerified && (
                                <button
                                    onClick={handleStartVerification}
                                    disabled={verifying}
                                    className="mt-4 w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>{verifying ? 'Initiating Verification...' : 'Verify Identity via Stripe'}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Drawer Footer (Sign Out) */}
                <div className="pt-6 border-t border-slate-800">
                    <button
                        onClick={handleSignOut}
                        className="w-full py-3 px-4 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </div>
    );
}