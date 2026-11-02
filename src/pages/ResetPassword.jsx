// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase.js';

export function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    // Verify user arrived with an active recovery session
    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (!data?.session) {
                setErrorMessage("Your password reset link is invalid or has expired. Please request a new one.");
            }
        };
        checkSession();
    }, []);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match. Please verify both fields.");
            return;
        }

        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) throw error;

            setIsSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            setErrorMessage(err.message || "Failed to update password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-slate-950">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 overflow-hidden">
                {/* Brand Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 mb-3 shadow-inner">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Reset Your Password
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Enter your new secure password for your LegiPulse account.
                    </p>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <div className="mb-6 p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-2xl flex items-center gap-2 text-xs text-rose-300">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Success View */}
                {isSuccess ? (
                    <div className="text-center space-y-4 py-4">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-100">Password Updated!</h2>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Your password has been changed successfully. Redirecting you to the dashboard...
                        </p>
                    </div>
                ) : (
                    /* Update Password Form */
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || Boolean(errorMessage && !password)}
                            className="w-full py-3 mt-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-cyan-950/50 disabled:bg-slate-800 disabled:text-slate-500"
                        >
                            {loading ? 'Updating Password...' : 'Set New Password'}
                        </button>
                    </form>
                )}

                {/* Footer Navigation */}
                <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors font-semibold"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Return to LegiPulse Home</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}