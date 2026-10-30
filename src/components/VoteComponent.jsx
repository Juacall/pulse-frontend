import React, { useState, useMemo } from 'react';
import { MinusCircle, ThumbsDown, ThumbsUp, Vote, LogIn, ShieldAlert } from 'lucide-react';
import { useAuthModal } from "../hooks/useAuthModal.js";
import { supabase } from "../lib/supabase.js";
import { useToast } from "../hooks/useToast.js";
import {useAuth} from "../hooks/useAuth.js";

export function VoteComponent({
                                  politicianId,
                                  user,
                                  selectedPolitician,
                                  onVerifyIdentity,
                                  onVote,
                              }) {
    const [loading, setLoading] = useState(false);

    // Global user vote map from AuthContext
    const { userVotesMap, updateUserVoteInMap } = useAuth();

    // Local state for in-flight optimistic overrides and server responses
    const [optimisticStance, setOptimisticStance] = useState(null);
    const [serverStats, setServerStats] = useState(null);
    const [prevPoliticianId, setPrevPoliticianId] = useState(null);

    const { openAuthModal } = useAuthModal();
    const { showToast } = useToast();

    const activePoliticianId = politicianId || selectedPolitician?.id;

    // Direct render-phase state reset when switching politicians (No useEffect needed)
    if (activePoliticianId !== prevPoliticianId) {
        setPrevPoliticianId(activePoliticianId);
        setOptimisticStance(null);
        setServerStats(null);
    }

    // Direct persistent stance resolution from AuthContext
    const persistentStance = useMemo(() => {
        if (!activePoliticianId || !userVotesMap) return null;
        const val = userVotesMap[activePoliticianId];
        return val ? String(val).toLowerCase() : null;
    }, [activePoliticianId, userVotesMap]);

    // Active UI stance: In-flight optimistic click > Persistent AuthContext stance
    const activeStance = optimisticStance ? optimisticStance.toLowerCase() : persistentStance;

    const notify = (msg, type = 'success') => {
        if (showToast) {
            showToast(msg, type);
        } else {
            console.log(`[${type.toUpperCase()}]: ${msg}`);
        }
    };

    // 1. Base stats derived during render
    const baseStats = useMemo(() => {
        const raw = serverStats || selectedPolitician?.sentimentStats;
        const approve = Number(raw?.approve) || 0;
        const neutral = Number(raw?.neutral) || 0;
        const disapprove = Number(raw?.disapprove) || 0;
        const totalVotes = Number(raw?.totalVotes) || (approve + neutral + disapprove);

        return { approve, neutral, disapprove, totalVotes };
    }, [serverStats, selectedPolitician?.sentimentStats]);

    // 2. Pure sentiment math derived during render
    const stats = useMemo(() => {
        if (!optimisticStance || optimisticStance.toLowerCase() === persistentStance) {
            return baseStats;
        }

        const updated = { ...baseStats };
        const targetStance = optimisticStance.toLowerCase();

        // EXISTING VOTE SWAP: Subtract 1 from old stance, add 1 to new stance
        if (persistentStance) {
            if (updated[persistentStance] > 0) {
                updated[persistentStance] -= 1;
            }
            updated[targetStance] = (updated[targetStance] || 0) + 1;
        }
        // BRAND NEW VOTE: Add 1 to new stance, increment totalVotes
        else {
            updated[targetStance] = (updated[targetStance] || 0) + 1;
            updated.totalVotes = (updated.totalVotes || 0) + 1;
        }

        return updated;
    }, [baseStats, optimisticStance, persistentStance]);

    // Visual bar percentages
    const total = stats.totalVotes > 0 ? stats.totalVotes : (stats.approve + stats.neutral + stats.disapprove);
    const approvePct = total > 0 ? (stats.approve / total) * 100 : 0;
    const neutralPct = total > 0 ? (stats.neutral / total) * 100 : 100;
    const disapprovePct = total > 0 ? (stats.disapprove / total) * 100 : 0;

    const handleVerifyIdentity = async () => {
        if (onVerifyIdentity) {
            onVerifyIdentity();
            return;
        }

        const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
        try {
            const sessionRes = await supabase.auth.getSession();
            const accessToken = sessionRes?.data?.session?.access_token;

            if (!accessToken) {
                openAuthModal("login");
                return;
            }

            const sessionUrl = new URL("/api/identity/create-session", baseUrl);
            const response = await fetch(sessionUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to create verification session");
            }

            const { url } = await response.json();
            if (url) {
                window.location.href = url;
            }
        } catch (err) {
            console.error('Failed to initiate Stripe verification:', err);
            notify(`Verification error: ${err.message}`, 'error');
        }
    };

    const handleVote = async (newStance) => {
        const targetStance = newStance.toLowerCase();
        if (activeStance === targetStance) return;

        if (!user) {
            notify("Please sign in to participate in voting.", "error");
            return;
        }

        if (!user?.user_metadata?.is_identity_verified) {
            notify("Constituent identity verification required to cast a vote.", "error");
            return;
        }

        const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;

        let session = null;
        try {
            const sessionRes = await supabase.auth.getSession();
            session = sessionRes?.data?.session;
        } catch (authErr) {
            console.warn("Session fetch failed:", authErr);
        }

        const accessToken = session?.access_token;
        if (!accessToken) {
            notify("Session expired. Please log in again.", "error");
            return;
        }

        // Apply instant optimistic UI update
        setOptimisticStance(targetStance);
        setLoading(true);

        try {
            const voteUrl = new URL("/api/vote", baseUrl);
            const response = await fetch(voteUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    politician_id: activePoliticianId,
                    vote_type: targetStance,
                })
            });

            const data = await response.json();

            if (response.ok) {
                const verifiedStance = (data.user_vote || targetStance).toLowerCase();

                // 1. Commit stance to global AuthContext
                updateUserVoteInMap(activePoliticianId, verifiedStance);

                // 2. Commit fresh backend stats directly in the event handler
                if (data.sentimentStats) {
                    setServerStats(data.sentimentStats);
                }

                // 3. Clear temporary override
                setOptimisticStance(null);
                notify(`Vote for ${verifiedStance.toUpperCase()} recorded!`, 'success');

                // 4. Update parent candidate list state
                onVote?.(activePoliticianId, data.sentimentStats || stats);
            } else {
                throw new Error(data.detail || 'Server rejected vote');
            }
        } catch (e) {
            console.error("Voting submission error:", e);
            setOptimisticStance(null);
            notify(e.message || "Unable to reach voting server.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 relative">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                    <Vote className="w-4 h-4 text-indigo-400" />
                    <span>Public Opinion & Verified Sentiment</span>
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                    {total} {total === 1 ? 'Vote' : 'Votes'}
                </span>
            </div>

            {/* Sentiment Visualizer Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-emerald-400">
                        Approve {total > 0 ? `(${approvePct.toFixed(0)}%)` : ''}
                    </span>
                    <span className="text-slate-400">
                        Neutral {total > 0 ? `(${neutralPct.toFixed(0)}%)` : '(100%)'}
                    </span>
                    <span className="text-rose-400">
                        Disapprove {total > 0 ? `(${disapprovePct.toFixed(0)}%)` : ''}
                    </span>
                </div>

                <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden flex ring-1 ring-slate-800">
                    <div
                        style={{ width: `${approvePct}%` }}
                        className="bg-emerald-500 h-full transition-all duration-500 ease-out"
                        title={`Approve: ${approvePct.toFixed(1)}%`}
                    />
                    <div
                        style={{ width: `${neutralPct}%` }}
                        className="bg-slate-600 h-full transition-all duration-500 ease-out"
                        title={`Neutral: ${neutralPct.toFixed(1)}%`}
                    />
                    <div
                        style={{ width: `${disapprovePct}%` }}
                        className="bg-rose-500 h-full transition-all duration-500 ease-out"
                        title={`Disapprove: ${disapprovePct.toFixed(1)}%`}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 mb-2">
                <button
                    disabled={loading}
                    onClick={() => handleVote('approve')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 ${
                        activeStance === 'approve'
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-lg shadow-emerald-950/50'
                            : 'bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/80 text-emerald-300'
                    }`}
                >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Approve</span>
                </button>
                <button
                    disabled={loading}
                    onClick={() => handleVote('neutral')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 ${
                        activeStance === 'neutral'
                            ? 'bg-slate-600 text-white ring-2 ring-slate-400 shadow-lg shadow-slate-950/50'
                            : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300'
                    }`}
                >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>Neutral</span>
                </button>
                <button
                    disabled={loading}
                    onClick={() => handleVote('disapprove')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 ${
                        activeStance === 'disapprove'
                            ? 'bg-rose-600 text-white ring-2 ring-rose-400 shadow-lg shadow-rose-950/50'
                            : 'bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300'
                    }`}
                >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Disapprove</span>
                </button>
            </div>

            {/* Contextual Banners */}
            {!user ? (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                        Sign in to record your verified vote.
                    </span>
                    <button
                        onClick={() => openAuthModal("login")}
                        className="text-cyan-400 font-semibold hover:underline shrink-0 ml-2"
                    >
                        Sign In
                    </button>
                </div>
            ) : !user?.user_metadata?.is_identity_verified && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-center justify-between text-xs text-amber-200">
                    <span className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        Stripe identity verification required to record votes.
                    </span>
                    <button
                        onClick={handleVerifyIdentity}
                        className="text-amber-400 font-bold underline hover:text-amber-300 transition-colors shrink-0 ml-2"
                    >
                        Verify ID
                    </button>
                </div>
            )}
        </div>
    );
}