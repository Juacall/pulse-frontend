import { useState, useMemo, useEffect } from "react";
import { STATE_NAMES } from "../constants/states";

function normalizeParty(partyStr) {
  if (!partyStr) return "Independent";
  const p = partyStr.toLowerCase();
  if (p.includes("democrat")) return "Democrat";
  if (p.includes("republican")) return "Republican";
  return "Independent";
}

/**
 * Calculates approval rating percentage from sentiment stats.
 * Returns "N/A" if total votes are <= minVotes (default 5).
 */
function calculateApprovalRating(sentimentStats, minVotes = 5) {
  const approve = Number(sentimentStats?.approve) || 0;
  const disapprove = Number(sentimentStats?.disapprove) || 0;
  const neutral = Number(sentimentStats?.neutral) || 0;
  const totalVotes = approve + disapprove + neutral;

  // Stays "N/A" for 0, 1, 2, 3, 4, and 5 votes
  if (totalVotes <= minVotes) {
    return "N/A";
  }

  const totalOpinion = approve + disapprove;
  if (totalOpinion === 0) {
    return "N/A";
  }

  return Math.round((approve / totalOpinion) * 100);
}

function enrichPolitician(p) {
  const stateCode = p.state || "US";
  const stateName = (STATE_NAMES && STATE_NAMES[stateCode]) || stateCode;

  // Read actual backend sentiment stats or default to clean zero state
  const sentimentStats = p.sentimentStats || { approve: 0, disapprove: 0, neutral: 0 };

  // Always compute metrics dynamically on the client
  const approvalRating = calculateApprovalRating(sentimentStats, 5);

  return {
    ...p,
    party: normalizeParty(p.party),
    stateName,
    bio: `${p.name} represents ${stateName} in the U.S. ${p.chamber || "Congress"}.`,
    sentimentStats,
    metrics: {
      sponsoredCount: p.sponsoredCount || 0,
      cosponsoredCount: p.cosponsoredCount || 0,
      passRate: p.passRate ?? null,
      approvalRating, // Single source of truth for cards and drawer
    },
    sponsoredBills: p.sponsoredBills || [],
    userComments: p.userComments || [],
  };
}

export function usePoliticians({
                                 selectedState = "ALL",
                                 selectedChamber = "ALL",
                                 searchQuery = "",
                                 selectedParty = "ALL",
                               }) {
  const [politicians, setPoliticians] = useState([]);
  const [status, setStatus] = useState("loading");
  const [selectedPolitician, setSelectedPolitician] = useState(null);

  useEffect(() => {
    const cleanSearch = searchQuery.trim();

    if (cleanSearch && cleanSearch.length < 2) {
      return;
    }

    let isCurrentRequest = true;

    const timer = setTimeout(async () => {
      setStatus("loading");

      try {
        const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const url = new URL("/api/politicians", baseUrl);

        if (cleanSearch) url.searchParams.append("search", cleanSearch);
        if (selectedState && selectedState !== "ALL") url.searchParams.append("state", selectedState);
        if (selectedChamber && selectedChamber !== "ALL") url.searchParams.append("chamber", selectedChamber);
        if (selectedParty && selectedParty !== "ALL") url.searchParams.append("party", selectedParty);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("Failed to fetch politicians");

        const data = await response.json();

        if (isCurrentRequest) {
          setPoliticians(data.map(enrichPolitician));
          setStatus("loaded");
        }
      } catch (err) {
        if (isCurrentRequest) {
          console.error("Error loading politicians:", err);
          setStatus("error");
        }
      }
    }, 300);

    return () => {
      isCurrentRequest = false;
      clearTimeout(timer);
    };
  }, [selectedState, selectedChamber, searchQuery, selectedParty]);

  const stateSummaryStats = useMemo(() => {
    if (!selectedState || selectedState === "ALL") return null;
    const members = politicians.filter((p) => p.state === selectedState);
    return {
      stateName: (STATE_NAMES && STATE_NAMES[selectedState]) || selectedState,
      code: selectedState,
      totalMembers: members.length,
      democrats: members.filter((m) => m.party === "Democrat").length,
      republicans: members.filter((m) => m.party === "Republican").length,
      totalBills: members.reduce((sum, m) => sum + (m.metrics?.sponsoredCount || 0), 0),
    };
  }, [selectedState, politicians]);

  /**
   * Accepts authoritative server sentimentStats returned from POST /api/vote
   */
  const handleVote = (politicianId, updatedSentimentStats) => {
    if (!updatedSentimentStats) return;

    const newApprovalRating = calculateApprovalRating(updatedSentimentStats, 5);

    const updateRecord = (p) => ({
      ...p,
      sentimentStats: updatedSentimentStats,
      metrics: {
        ...p.metrics,
        approvalRating: newApprovalRating,
      },
    });

    setPoliticians((prev) =>
        prev.map((p) => (p.id === politicianId ? updateRecord(p) : p))
    );

    setSelectedPolitician((prev) =>
        prev && prev.id === politicianId ? updateRecord(prev) : prev
    );
  };

  return {
    filteredPoliticians: politicians,
    stateSummaryStats,
    isLoading: status === "loading",
    hasError: status === "error",
    selectedPolitician,
    setSelectedPolitician,
    handleVote,
  };
}