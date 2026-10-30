// src/context/AuthProvider.jsx
import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '../lib/supabase';
import { APP_ENV, getInitialUser } from '../config/env';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userVotesMap, setUserVotesMap] = useState({});

    // Fetch batch votes for the authenticated user
    const fetchAllUserVotes = async (userid,accessToken) => {
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
                const voteMap = await res.json();
                setUserVotesMap(voteMap);
            }
        } catch (err) {
            console.warn("Could not fetch user vote summary from backend:", err);
        }
    };

    useEffect(() => {
        // 1. App load: Seed with initial session or env mock
        supabase.auth.getSession().then(({ data: { session } }) => {
            const activeUser = session?.user ?? getInitialUser(APP_ENV);
            setUser(activeUser);
            setLoading(false);
        });

        // 2. Auth state shifts: Explicitly handle login vs logout
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null); // Keep user logged out when they explicitly click Sign Out
            } else if (session?.user) {
                setUser(session.user); // Logged in with real account
                fetchAllUserVotes(session.user.id, session?.access_token);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Instant local mutation when the user casts or switches a vote
    const updateUserVoteInMap = (politicianId, newVoteType) => {
        setUserVotesMap((prev) => ({
            ...prev,
            [politicianId]: newVoteType,
        }));
    };

    // Dev Helper: Simulate identity verification locally
    const simulateVerifyIdentity = () => {
        setUser((prevUser) => {
            if (!prevUser) return prevUser;
            return {
                ...prevUser,
                user_metadata: {
                    ...prevUser.user_metadata,
                    is_identity_verified: true,
                },
            };
        });
    };

    return (
        <AuthContext.Provider value={{ user, userVotesMap,updateUserVoteInMap,loading, supabase, simulateVerifyIdentity }}>
            {children}
        </AuthContext.Provider>
    );
}