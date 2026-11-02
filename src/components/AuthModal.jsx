// src/components/AuthModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Mail, User, ShieldCheck, KeyRound, ArrowLeft } from 'lucide-react';
import { supabase } from "../lib/supabase.js";
import { Turnstile } from 'react-turnstile';

export function AuthModal({ isOpen, mode, setMode, onClose }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState(null);
    const turnstileRef = useRef(null);
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;

    // Reset internal form state and Turnstile widget when switching modes or closing
    const handleSwitchMode = (newMode) => {
        setErrorMessage('');
        setSuccessMessage('');
        setTurnstileToken(null);
        turnstileRef.current?.reset();
        setMode(newMode);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
    };

    // Close modal on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Password Reset Submission Handler
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!turnstileToken) {
            setErrorMessage("Please complete the security check before proceeding.");
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // Validate Turnstile token with FastAPI backend
            const verifyUrl = new URL("/api/auth/verify-turnstile", baseUrl);
            const verifyRes = await fetch(verifyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ turnstile_token: turnstileToken })
            });

            if (!verifyRes.ok) {
                const errData = await verifyRes.json();
                throw new Error(errData.detail || "Bot protection check failed");
            }

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setSuccessMessage(`Password reset instructions sent to ${email}. Please check your inbox.`);
        } catch (err) {
            setErrorMessage(err.message || 'Failed to send password reset email.');
        } finally {
            setLoading(false);
            setTurnstileToken(null);
            turnstileRef.current?.reset();
        }
    };

    // Combined Auth Form Submission Handler (Login & Registration)
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Password Confirmation Check on Registration
        if (mode === 'register' && password !== confirmPassword) {
            setErrorMessage("Passwords do not match. Please verify both fields.");
            return;
        }

        // 2. Ensure Turnstile check is completed
        if (!turnstileToken) {
            setErrorMessage("Please complete the security check before proceeding.");
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            // Validate Turnstile token with FastAPI backend
            const verifyUrl = new URL("/api/auth/verify-turnstile", baseUrl);
            const verifyRes = await fetch(verifyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ turnstile_token: turnstileToken })
            });

            if (!verifyRes.ok) {
                const errData = await verifyRes.json();
                throw new Error(errData.detail || "Bot protection check failed");
            }

            // Proceed with Supabase Auth after backend clearance
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onClose();
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName
                        }
                    }
                });

                if (error) throw error;

                // Existing Account Detection: Supabase returns identity array length 0 if account already exists
                if (data?.user && data?.user?.identities?.length === 0) {
                    setErrorMessage("An account with this email address already exists. Please sign in instead.");
                    return;
                }

                // Check if email confirmation step is active
                if (data?.user && !data?.session) {
                    setRegisteredEmail(email);
                    setIsSubmitted(true);
                } else {
                    onClose();
                }
            }
        } catch (err) {
            // Custom friendly message mapping for duplicate registrations
            if (err.message?.toLowerCase().includes("user already registered") || err.message?.toLowerCase().includes("already exists")) {
                setErrorMessage("An account with this email address already exists. Please sign in instead.");
            } else {
                setErrorMessage(err.message || 'Authentication failed. Please try again.');
            }
        } finally {
            setLoading(false);
            setTurnstileToken(null);
            turnstileRef.current?.reset();
        }
    };

    // Handle Google OAuth Login/Registration
    const handleGoogleSignIn = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) throw error;
        } catch (err) {
            console.error('Google Auth Error:', err.message);
        }
    };

    // Render "Check Your Email" Confirmation View
    if (isSubmitted) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
                        <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-100">Check Your Email</h3>
                    <p className="text-sm text-slate-300">
                        We sent a confirmation link to <span className="text-cyan-400 font-semibold">{registeredEmail}</span>.
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Click the link in your email to activate your constituent account, then sign in.
                    </p>
                    <button
                        onClick={() => {
                            setIsSubmitted(false);
                            onClose();
                        }}
                        className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-colors"
                    >
                        Return to App
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col">

                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                            {mode === 'reset' ? <KeyRound className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-base">
                                {mode === 'login'
                                    ? 'Sign In to LegiPulse'
                                    : mode === 'register'
                                        ? 'Create Account'
                                        : 'Reset Password'}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {mode === 'login'
                                    ? 'Access your profile, vote history, and AI Search.'
                                    : mode === 'register'
                                        ? 'Join to participate in congressional analytics.'
                                        : 'Enter your email to receive a password reset link.'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Status Banners */}
                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-300">
                        {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-xs text-emerald-300">
                        {successMessage}
                    </div>
                )}

                {/* Google Auth Button (Login & Register modes) */}
                {mode !== 'reset' && (
                    <>
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-100 rounded-xl text-sm font-semibold transition-colors mb-4"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                            </svg>
                            <span>Continue with Google</span>
                        </button>

                        <div className="relative flex items-center justify-center mb-4">
                            <div className="border-t border-slate-800 w-full"></div>
                            <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">or</span>
                        </div>
                    </>
                )}

                {/* Form Body */}
                {mode === 'reset' ? (
                    /* Password Reset Form */
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center py-1">
                            <Turnstile
                                ref={turnstileRef}
                                sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                                onSuccess={(token) => setTurnstileToken(token)}
                                onExpire={() => setTurnstileToken(null)}
                                onError={() => setTurnstileToken(null)}
                                options={{ theme: 'dark' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !turnstileToken}
                            className="w-full py-2.5 mt-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-colors shadow-lg disabled:bg-slate-800 disabled:text-slate-500"
                        >
                            {loading ? 'Sending Request...' : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    /* Login / Register Form */
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Jane Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-semibold text-slate-400">Password</label>
                                {mode === 'login' && (
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchMode('reset')}
                                        className="text-[11px] text-cyan-400 hover:underline font-medium"
                                    >
                                        Forgot Password?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        {/* Confirm Password Field on Registration */}
                        {mode === 'register' && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Turnstile Security Widget */}
                        <div className="flex justify-center py-1">
                            <Turnstile
                                ref={turnstileRef}
                                sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                                onSuccess={(token) => setTurnstileToken(token)}
                                onExpire={() => setTurnstileToken(null)}
                                onError={() => setTurnstileToken(null)}
                                options={{ theme: 'dark' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !turnstileToken}
                            className="w-full py-2.5 mt-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-colors shadow-lg disabled:bg-slate-800 disabled:text-slate-500"
                        >
                            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Register Account')}
                        </button>
                    </form>
                )}

                {/* Footer Toggle Navigation */}
                <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
                    {mode === 'reset' ? (
                        <button
                            type="button"
                            onClick={() => handleSwitchMode('login')}
                            className="inline-flex items-center gap-1 text-cyan-400 hover:underline font-semibold"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Sign In</span>
                        </button>
                    ) : mode === 'login' ? (
                        <span>
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => handleSwitchMode('register')}
                                className="text-cyan-400 hover:underline font-semibold"
                            >
                                Sign up
                            </button>
                        </span>
                    ) : (
                        <span>
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => handleSwitchMode('login')}
                                className="text-cyan-400 hover:underline font-semibold"
                            >
                                Sign in
                            </button>
                        </span>
                    )}
                </div>

            </div>
        </div>
    );
}