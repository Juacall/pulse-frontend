import { useState, useMemo, useEffect, useRef } from "react";
import { STATE_NAMES } from "../constants/states";

function normalizeParty(partyStr) {
  if (!partyStr) return "Independent";
  const p = partyStr.toLowerCase();
  if (p.includes("democrat")) return "Democratic";
  if (p.includes("republican")) return "Republican";
  return "Independent";
}

function calculateApprovalRating(sentimentStats, minVotes = 5) {
  const approve = Number(sentimentStats?.approve) || 0;
  const disapprove = Number(sentimentStats?.disapprove) || 0;
  const neutral = Number(sentimentStats?.neutral) || 0;
  const totalVotes = approve + disapprove + neutral;

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
  const sentimentStats = p.sentimentStats || { approve: 0, disapprove: 0, neutral: 0 };
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
      approvalRating,
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
                                 selectedStatus = "ALL",
                               }) {
  const [rawPoliticians, setRawPoliticians] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [status, setStatus] = useState("loading");
  const [selectedPolitician, setSelectedPolitician] = useState(null);

  // Client-side cache for full state datasets: { 'CA': [...], 'NY': [...], 'ALL': [...] }
  const cacheRef = useRef({});

  const cleanSearch = searchQuery.trim();
  const isSearchActive = cleanSearch.length >= 2;

  // 1. Fetching Logic (Routes between /list and /search)
  useEffect(() => {
    let isCurrentRequest = true;

    const timer = setTimeout(async () => {
      setStatus("loading");

      try {
        const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;

        // PATH A: Active Global Search -> Query /api/politicians/search
        if (isSearchActive) {
          const searchUrl = new URL("/api/politicians/search", baseUrl);
          searchUrl.searchParams.append("q", cleanSearch);

          if (selectedState && selectedState !== "ALL") {
            searchUrl.searchParams.append("state", selectedState);
          }
          if (selectedChamber && selectedChamber !== "ALL") {
            searchUrl.searchParams.append("chamber", selectedChamber);
          }
          if (selectedParty && selectedParty !== "ALL") {
            searchUrl.searchParams.append("party", selectedParty);
          }
          if (selectedStatus && selectedStatus !== "ALL") {
            searchUrl.searchParams.append("status", selectedStatus);
          }

          const response = await fetch(searchUrl.toString());
          if (!response.ok) throw new Error("Search request failed");

          const data = await response.json();
          if (isCurrentRequest) {
            setSearchResults(data.map(enrichPolitician));
            setStatus("loaded");
          }
          return;
        }

        // PATH B: State / Default Dataset -> Query /api/politicians/list (with local caching)
        const cacheKey = selectedState;

        if (cacheRef.current[cacheKey]) {
          setRawPoliticians(cacheRef.current[cacheKey]);
          setStatus("loaded");
          return;
        }

        const listUrl = new URL("/api/politicians/list", baseUrl);
        if (selectedState && selectedState !== "ALL") {
          listUrl.searchParams.append("state", selectedState);
        }

        const response = await fetch(listUrl.toString());
        if (!response.ok) throw new Error("List request failed");

        const data = await response.json();
        const enrichedData = data.map(enrichPolitician);

        if (isCurrentRequest) {
          cacheRef.current[cacheKey] = enrichedData;
          setRawPoliticians(enrichedData);
          setStatus("loaded");
        }
      } catch (err) {
        if (isCurrentRequest) {
          console.error("Error loading politicians:", err);
          setStatus("error");
        }
      }
    }, isSearchActive ? 300 : 0); // Debounce search calls only

    return () => {
      isCurrentRequest = false;
      clearTimeout(timer);
    };
  }, [selectedState, cleanSearch, selectedChamber, selectedParty, selectedStatus, isSearchActive]);

  // 2. Client-Side Filter Execution (Applies when browsing state/default cached datasets)
  const filteredPoliticians = useMemo(() => {
    // When searching, server already returns filtered results
    if (isSearchActive) {
      return searchResults;
    }

    return rawPoliticians.filter((p) => {
      // Chamber Filter
      if (selectedChamber !== "ALL" && p.chamber !== selectedChamber) {
        return false;
      }

      // Party Filter
      if (selectedParty !== "ALL" && p.party !== selectedParty) {
        return false;
      }

      // Candidate Status Filter
      if (selectedStatus !== "ALL") {
        const isIncumbent = p.isIncumbent === true || String(p.isIncumbent).toLowerCase() === "true";
        const statusStr = (p.status || "").toLowerCase();
        const target = selectedStatus.toLowerCase();
        console.log(isIncumbent)
        console.log(statusStr)
        console.log(target)

        if (target === "incumbent" && !isIncumbent && statusStr !== "incumbent") {
          return false;
        }
        if (
            target === "challenger" &&
            statusStr !== "candidate" &&
            (isIncumbent || statusStr !== "candidate")
        ) {
          return false;
        }

      }

      return true;
    });
  }, [rawPoliticians, searchResults, isSearchActive, selectedChamber, selectedParty, selectedStatus]);

  // 3. State Summary Statistics Calculation
  const stateSummaryStats = useMemo(() => {
    if (!selectedState || selectedState === "ALL") return null;
    const currentDataset = isSearchActive ? searchResults : rawPoliticians;

    return {
      stateName: (STATE_NAMES && STATE_NAMES[selectedState]) || selectedState,
      code: selectedState,
      totalMembers: currentDataset.length,
      democrats: currentDataset.filter((m) => m.party === "Democratic").length,
      republicans: currentDataset.filter((m) => m.party === "Republican").length,
      totalBills: currentDataset.reduce((sum, m) => sum + (m.metrics?.sponsoredCount || 0), 0),
    };
  }, [selectedState, rawPoliticians, searchResults, isSearchActive]);

  // 4. Handle Real-Time Voting State Sync
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

    setRawPoliticians((prev) => prev.map((p) => (p.id === politicianId ? updateRecord(p) : p)));
    setSearchResults((prev) => prev.map((p) => (p.id === politicianId ? updateRecord(p) : p)));
    setSelectedPolitician((prev) => (prev && prev.id === politicianId ? updateRecord(prev) : prev));
  };

  return {
    filteredPoliticians,
    stateSummaryStats,
    isLoading: status === "loading",
    hasError: status === "error",
    selectedPolitician,
    setSelectedPolitician,
    handleVote,
  };
}