// src/context/AuthProvider.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '../lib/supabase';
import { APP_ENV, getInitialUser } from '../config/env';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userVotesMap, setUserVotesMap] = useState({});

    // Fetch user summary (verification status, profile details, and votes map)
    const fetchUserSummary = useCallback(async (sessionUser, accessToken) => {
        if (!accessToken) {
            setUserVotesMap({});
            return;
        }

        try {
            const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
            const res = await fetch(`${baseUrl}/api/votes/usersummary`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const data = await res.json();

                // Extract votes map and update local voting state
                const votesMap = data.votes_map || data || {};
                setUserVotesMap(votesMap);

                // Enrich user state with live identity verification flags
                setUser((prevUser) => {
                    const baseUser = sessionUser || prevUser;
                    if (!baseUser) return null;

                    return {
                        ...baseUser,
                        is_identity_verified: data.is_identity_verified ?? baseUser.is_identity_verified ?? false,
                        stripe_verification_id: data.stripe_verification_id ?? baseUser.stripe_verification_id ?? null,
                        user_metadata: {
                            ...(baseUser.user_metadata || {}),
                            is_identity_verified: data.is_identity_verified ?? baseUser.user_metadata?.is_identity_verified ?? false
                        }
                    };
                });
            }
        } catch (err) {
            console.warn("Could not fetch user summary from backend:", err);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        // 1. Initial Session Hydration
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!isMounted) return;
            const activeUser = session?.user ?? getInitialUser(APP_ENV);
            setUser(activeUser);

            if (session?.access_token) {
                fetchUserSummary(session.user, session.access_token);
            }
            setLoading(false);
        });

        // 2. Auth State Change Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!isMounted) return;

            if (event === 'SIGNED_OUT') {
                setUser(null);
                setUserVotesMap({});
            } else if (session?.user) {
                setUser(session.user);
                fetchUserSummary(session.user, session.access_token);
            }
            setLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [fetchUserSummary]);

    // Instant local mutation when the user casts or switches a vote
    const updateUserVoteInMap = (politicianId, newVoteType) => {
        setUserVotesMap((prev) => ({
            ...prev,
            [politicianId]: newVoteType,
        }));
    };

    // Helper to trigger a manual sync (e.g. after returning from Stripe Identity flow)
    const refreshUserSummary = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && session?.access_token) {
            await fetchUserSummary(session.user, session.access_token);
        }
    };

    // Dev Helper: Simulate identity verification locally
    const verifyIdentity = async () => {
        if (APP_ENV === 'mock') {
            setUser((prevUser) => {
                if (!prevUser) return prevUser;
                return {
                    ...prevUser,
                    is_identity_verified: true,
                    user_metadata: {
                        ...(prevUser.user_metadata || {}),
                        is_identity_verified: true,
                    },
                };
            });
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error("No active session found. Please log in.");
            }

            const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
            const res = await fetch(`${baseUrl}/api/identity/create-session`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || "Failed to initiate Stripe identity verification.");
            }

            const { url } = await res.json();
            if (url) {
                // Redirect user to Hosted Stripe Verification Flow
                window.location.href = url;
            }
        } catch (err) {
            console.error("Error initiating identity verification:", err);
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            userVotesMap,
            updateUserVoteInMap,
            loading,
            supabase,
            verifyIdentity,
            refreshUserSummary
        }}>
            {children}
        </AuthContext.Provider>
    );
}