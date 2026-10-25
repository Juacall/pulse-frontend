import { useState, useEffect } from 'react';
import { MinusCircle, ThumbsDown, ThumbsUp, Vote, LogIn, ShieldAlert } from 'lucide-react';
import { useAuthModal } from "../hooks/useAuthModal.js";
import { supabase } from "../lib/supabase.js";
import { useToast } from "../hooks/useToast.js";

export function VoteComponent({
                                  politicianId,
                                  user,
                                  selectedPolitician,
                                  initialUserVote = null,
                                  onVerifyIdentity,
                                  onStatsLoaded,
                                  onVote,
                              }) {
    const [loading, setLoading] = useState(false);
    const [userVote, setUserVote] = useState(initialUserVote);
    const { openAuthModal } = useAuthModal();
    const { showToast } = useToast();

    const activePoliticianId = politicianId || selectedPolitician?.id;

    const [stats, setStats] = useState(() => {
        return { approve: 0, neutral: 0, disapprove: 0 };
    });

    const notify = (msg, type = 'success') => {
        if (showToast) {
            showToast(msg, type);
        } else {
            console.log(`[${type.toUpperCase()}]: ${msg}`);
        }
    };

    // 1. Fetch initial vote counts from backend on mount
    useEffect(() => {
        if ( !activePoliticianId) return;

        let isSubscribed = true;
        const fetchVoteStats = async () => {
            const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
            try {
                const statsUrl = new URL(`/api/votes/stats/${activePoliticianId}`, baseUrl);
                const res = await fetch(statsUrl);
                if (res.ok) {
                    const data = await res.json();
                    if (isSubscribed && data?.sentimentStats) {
                        setStats({
                            approve: data.sentimentStats.approve || 0,
                            neutral: data.sentimentStats.neutral || 0,
                            disapprove: data.sentimentStats.disapprove || 0,
                        });
                        onStatsLoaded?.(activePoliticianId, data.sentimentStats);
                    }
                }
            } catch (err) {
                console.warn("Could not fetch vote statistics:", err);
            }
        };

        fetchVoteStats();
        return () => { isSubscribed = false; };
    }, [activePoliticianId]);

    // 2. Compute dynamic bar percentages
    const totalVotes = stats.approve + stats.neutral + stats.disapprove;

    const approvePct = totalVotes > 0 ? (stats.approve / totalVotes) * 100 : 0;
    const neutralPct = totalVotes > 0 ? (stats.neutral / totalVotes) * 100 : 100;
    const disapprovePct = totalVotes > 0 ? (stats.disapprove / totalVotes) * 100 : 0;

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

    // Immediate local adjustment (no vote count inflation)
    const applyOptimisticVote = (newStance) => {
        setStats((prev) => {
            const updated = { ...prev };

            // If switching stances, subtract from previous choice
            if (userVote && userVote !== newStance && updated[userVote] > 0) {
                updated[userVote] -= 1;
            }

            // Increment new choice
            if (userVote !== newStance) {
                updated[newStance] = (updated[newStance] || 0) + 1;
            }

            return updated;
        });

        setUserVote(newStance);
    };

    const handleVote = async (newStance) => {
        if (userVote === newStance) return;

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

        const previousStance = userVote;
        const previousStats = { ...stats };

        // 3. Immediate local feedback
        applyOptimisticVote(newStance);
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
                    vote_type: newStance,
                })
            });

            const data = await response.json();

            if (response.ok) {
                // 4. Synchronize with exact server-returned totals
                if (data.sentimentStats) {
                    setStats(data.sentimentStats);
                }
                if (data.user_vote) {
                    setUserVote(data.user_vote);
                }
                notify(`Vote for ${newStance.toUpperCase()} recorded!`, 'success');
                // 👈 Pass the exact server-returned stats to update parent cards & drawer
                onVote?.(activePoliticianId, data.sentimentStats);
            } else {
                throw new Error(data.detail || 'Server rejected vote');
            }
        } catch (e) {
            console.error("Voting submission error:", e);
            // Rollback on failure
            setUserVote(previousStance);
            setStats(previousStats);
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
                    {totalVotes} {totalVotes === 1 ? 'Vote' : 'Votes'}
                </span>
            </div>

            {/* Substrate Sentiment Visualizer Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-emerald-400">
                        Approve {totalVotes > 0 ? `(${approvePct.toFixed(0)}%)` : ''}
                    </span>
                    <span className="text-slate-400">
                        Neutral {totalVotes > 0 ? `(${neutralPct.toFixed(0)}%)` : '(100%)'}
                    </span>
                    <span className="text-rose-400">
                        Disapprove {totalVotes > 0 ? `(${disapprovePct.toFixed(0)}%)` : ''}
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

            {/* Voting Action Buttons */}
            <div className="flex items-center space-x-2 mb-2">
                <button
                    disabled={loading}
                    onClick={() => handleVote('approve')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 ${
                        userVote === 'approve'
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
                        userVote === 'neutral'
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
                        userVote === 'disapprove'
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