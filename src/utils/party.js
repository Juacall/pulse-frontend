export function normalizeParty(party) {
  const value = String(party ?? "").trim();
  const normalized = value.toLowerCase();

  if (["d", "democrat", "democratic", "democratic party"].includes(normalized)) {
    return "Democratic";
  }
  if (["r", "republic", "republican", "republican party"].includes(normalized)) {
    return "Republican";
  }
  return value || "Unknown";
}

export function partyBadgeClass(party) {
  if (party === "Democratic") {
    return "bg-blue-950/80 text-blue-300 border border-blue-800/60";
  }
  if (party === "Republican") {
    return "bg-red-950/80 text-red-300 border border-red-800/60";
  }
  return "bg-slate-800 text-slate-300 border border-slate-700";
}
