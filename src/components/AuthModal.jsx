import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { supabase } from "../lib/supabase.js";
import { Turnstile } from 'react-turnstile';

export function AuthModal({ isOpen, mode, setMode, onClose }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [verifyIdentity, setVerifyIdentity] = useState(false);
    const [showIdentityExcerpt, setShowIdentityExcerpt] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState(null);
    const turnstileRef = useRef(null);
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;

    // Reset internal state and Turnstile widget when modal opens, closes, or switches modes
    const handleSwitchMode = (newMode) => {
        setErrorMessage('');
        setTurnstileToken(null);
        turnstileRef.current?.reset();
        setMode(newMode);
        setEmail('')
        setPassword('')
        setFullName('')
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

    // Combined Auth Form Submission Handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Ensure Turnstile check is completed
        if (!turnstileToken) {
            setErrorMessage("Please complete the security check before proceeding.");
            return;
        }

        setLoading(true);
        setErrorMessage('');


        try {
            // 2. Validate Turnstile token with FastAPI backend
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

            // 3. Proceed with Supabase Auth after backend clearance
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
                            full_name: fullName,
                            verify_requested: verifyIdentity
                        }
                    }
                });
                if (error) throw error;

                // Handle Optional Identity Verification Session
                if (verifyIdentity && data?.session?.access_token) {
                    const sessionUrl = new URL('/api/identity/create-session', baseUrl);
                    const res = await fetch(sessionUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${data.session.access_token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    const sessionData = await res.json();
                    if (sessionData?.url) {
                        window.location.href = sessionData.url;
                        return;
                    }
                }

                // Check if email confirmation step is active in Supabase
                if (data?.user && !data?.session) {
                    setRegisteredEmail(email);
                    setIsSubmitted(true);
                } else {
                    onClose();
                }
            }
        } catch (err) {
            setErrorMessage(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);

            // Reset single-use Turnstile token
            setTurnstileToken(null);
            if (turnstileRef.current) {
                turnstileRef.current.reset();
            }
        }
    };

    // Handle Google OAuth Login/Registration
    const handleGoogleLogin = async () => {
        setErrorMessage('');
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${baseUrl}/auth/callback?verify=${verifyIdentity}`,
            },
        });

        if (error) setErrorMessage(error.message);
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
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-base">
                                {mode === 'login' ? 'Sign In to LegiPulse' : 'Create Account'}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {mode === 'login'
                                    ? 'Access your profile, vote history, and AI Search.'
                                    : 'Join to participate in congressional analytics.'}
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

                {/* Error Banner */}
                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-300">
                        {errorMessage}
                    </div>
                )}

                {/* Google Auth Button */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
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

                {/* Divider */}
                <div className="relative flex items-center justify-center mb-4">
                    <div className="border-t border-slate-800 w-full"></div>
                    <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">or</span>
                </div>

                {/* Identity Verification Toggle Option */}
                {mode === 'register' && (
                <div className="mb-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
                    <div className="flex items-start justify-between gap-2">
                        <label className="flex items-center space-x-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={verifyIdentity}
                                onChange={(e) => setVerifyIdentity(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                            />
                            <span className="text-xs font-semibold text-slate-200">
                                Verify constituent identity via Stripe
                            </span>
                        </label>

                        <button
                            type="button"
                            onClick={() => setShowIdentityExcerpt(!showIdentityExcerpt)}
                            className="text-slate-400 hover:text-cyan-400 text-xs flex items-center gap-0.5"
                        >
                            <Info className="w-3.5 h-3.5" />
                            {showIdentityExcerpt ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                    </div>

                    {/* Inline Excerpt */}
                    {showIdentityExcerpt && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 leading-relaxed">
                            <p>
                                Verification establishes your legislative district and state locality without storing raw ID photos. Unlocks voting privileges on candidate profiles and legislative proposals.
                            </p>
                        </div>
                    )}
                </div>
                )}

                {/* Auth Form */}
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
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
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

                {/* Footer Toggle */}
                <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
                    {mode === 'login' ? (
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