import React from 'react';
import { ChevronRight, MapPin } from 'lucide-react';
import { getMemberImageUrl } from "../utils/image";
import { partyBadgeClass } from "../utils/party";
import { getMissedPercentage } from "../utils/rollCall";
import { getFallbackAvatar } from "../utils/avatar";

const HIGH_ABSENCE_THRESHOLD = 8.0;

// Format total campaign receipts for display (e.g., $1.2M, $450k)
function formatReceipts(amount) {
  if (amount == null || amount === 0) return "Pending";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}k`;
  return `$${amount.toLocaleString()}`;
}

// Extract campaign launch year from first_file_date / firstFileDate
function getLaunchYear(dateString) {
  if (!dateString) return "2026";
  const date = new Date(dateString);
  return isNaN(date.getFullYear()) ? "2026" : date.getFullYear();
}

export function PoliticianCard({ politician: p, onSelect }) {
  const missedPercentage = getMissedPercentage(p.rollCallVotes);
  const isHighAbsence = (missedPercentage ?? 0) > HIGH_ABSENCE_THRESHOLD;

  // Status check: fallback to p.status if is_incumbent boolean is not explicitly provided
  const isIncumbent = p.is_incumbent ?? p.isIncumbent ?? (p.status === "Active");

  // Approval display string with fallback
  const approvalDisplay = (p.metrics?.approvalRating === "N/A" || p.metrics?.approvalRating == null)
      ? "N/A"
      : `${p.metrics.approvalRating}%`;

  // Challenger values mapping (handles camelCase or snake_case API properties)
  const totalRaised = p.totalReceipts ?? p.total_receipts;
  const launchDate = p.firstFileDate ?? p.first_file_date;
  const totalVotes = p.sentimentStats.totalVotes


  return (
      <div
          onClick={() => onSelect(p)}
          className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-950/30 cursor-pointer group flex flex-col justify-between h-full"
      >
        <div className="flex-1 flex flex-col">
          {/* Header: Candidate image, name, and location */}
          <div className="flex items-center space-x-3 mb-3">
            <img
                src={p.imageUrl ? p.imageUrl : getMemberImageUrl(p.id, "225x275")}
                alt={p.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getFallbackAvatar(p.name, p.party);
                }}
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 group-hover:border-cyan-400 transition-colors flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-white group-hover:text-cyan-300 transition-colors text-base truncate">
                {p.name}
              </h3>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <span className="truncate">{p.stateName || p.state} ({p.state})</span>
                <span>•</span>
                <span>{p.chamber}</span>
              </div>
            </div>
          </div>

          {/* Bio Text: Fixed height wrapper prevents vertical layout shifts */}
          <div className="h-9 mb-3 flex items-start">
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {p.bio || "No biographical information available for this candidate."}
            </p>
          </div>

          {/* Badge Ribbon: Positioned above the metrics grid */}
          <div className="flex flex-wrap items-center gap-1.5 min-h-[26px] mb-3">
            {/* Status Badge */}
            {isIncumbent ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
          Incumbent
        </span>
            ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
          Challenger
        </span>
            )}

            {/* Party Badge */}
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${partyBadgeClass(p.party)}`}>
        {p.party}
      </span>

            {/* Attendance / Absence Badge (Incumbents Only) */}
            {isIncumbent && missedPercentage != null && (
                <span
                    title="Share of roll call votes missed"
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isHighAbsence
                            ? "bg-amber-950/80 text-amber-300 border-amber-800/60"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                >
          Absence · {Number(missedPercentage).toFixed(1)}%
        </span>
            )}
          </div>

          {/* Metrics Grid: Standard 3-column with vertical dividers for all candidates */}
          <div className="mt-auto grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center mb-4">
            {isIncumbent ? (
                <>
                  <div className="border-r border-slate-800/60 pr-2 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Bills</span>
                    <span className="text-xs font-bold text-slate-200">{p.metrics?.sponsoredCount ?? 0}</span>
                  </div>
                  <div className="border-r border-slate-800/60 px-2 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Pass Rate</span>
                    <span className="text-xs font-bold text-emerald-400">
              {p.metrics?.passRate == null ? "N/A" : `${p.metrics.passRate}%`}
            </span>
                  </div>
                  <div className="pl-2 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">
                      Public Appr.
                    </span>
                    <div className="flex items-baseline justify-center space-x-1.5 mt-0.5">
                        <span className={`text-xs font-bold ${approvalDisplay === 'N/A' ? 'text-slate-400' : 'text-cyan-400'}`}>
                          {approvalDisplay}
                        </span>
                        {totalVotes > 0 && (
                          <span className="text-xs font-medium text-slate-400">
                              ({totalVotes})
                          </span>
                      )}
                    </div>
                  </div>
                </>
            ) : (
                <>
                  <div className="border-r border-slate-800/60 pr-2 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Total Raised</span>
                    <span className="text-xs font-bold text-cyan-400">
              {formatReceipts(totalRaised)}
            </span>
                  </div  >
                  <div className="border-r border-slate-800/60 px-2 flex flex-col items-center justify-center ">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Campaign</span>
                    <span className="text-xs font-bold text-slate-200">
              Since {getLaunchYear(launchDate)}
            </span>
                  </div>
                  <div className="pl-2 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">
                      Public Appr.
                    </span>
                    <div className="flex items-baseline justify-center space-x-1.5 mt-0.5">
                        <span className={`text-xs font-bold ${approvalDisplay === 'N/A' ? 'text-slate-400' : 'text-cyan-400'}`}>
                          {approvalDisplay}
                        </span>
                      {totalVotes > 0 && (
                          <span className="text-xs font-medium text-slate-400">
                              ({totalVotes})
                          </span>
                      )}
                    </div>
                  </div>
                </>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium group-hover:translate-x-1 transition-transform">
          <span>View Full Profile & Donors</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
  );
}
