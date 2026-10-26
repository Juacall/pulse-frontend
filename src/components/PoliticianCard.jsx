import React from 'react';
import { ChevronRight, MapPin } from 'lucide-react';
import { getMemberImageUrl } from "../utils/image";
import { partyBadgeClass } from "../utils/party";
import { getMissedPercentage } from "../utils/rollCall";

const FALLBACK_MEMBER_IMAGE = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80";

const HIGH_ABSENCE_THRESHOLD = 8.0;

export function PoliticianCard({ politician: p, onSelect }) {
  const missedPercentage = getMissedPercentage(p.rollCallVotes);
  const isHighAbsence = (missedPercentage ?? 0) > HIGH_ABSENCE_THRESHOLD;

  // Use metrics.approvalRating from hook or calculate directly with "N/A" fallback
  const approvalDisplay = (p.metrics?.approvalRating === "N/A" || p.metrics?.approvalRating == null)
      ? "N/A"
      : `${p.metrics.approvalRating}%`;
  return (
      <div
          onClick={() => onSelect(p)}
          className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-950/30 cursor-pointer group flex flex-col justify-between"
      >
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img
                  src={getMemberImageUrl(p.id, "225x275")}
                  alt={p.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_MEMBER_IMAGE;
                  }}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 group-hover:border-cyan-400 transition-colors"
              />
              <div>
                <h3 className="font-bold text-white group-hover:text-cyan-300 transition-colors text-base">
                  {p.name}
                </h3>
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{p.stateName} ({p.state})</span>
                  <span>•</span>
                  <span>{p.chamber}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${partyBadgeClass(p.party)}`}>
                {p.party}
              </span>
              {missedPercentage != null && (
              <span
                  title="Share of roll call votes missed"
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      isHighAbsence
                          ? "bg-amber-950/80 text-amber-300 border-amber-800/60"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
              >
                Absence · {missedPercentage == null ? "N/A" : `${Number(missedPercentage).toFixed(1)}%`}
              </span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {p.bio}
          </p>

          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center mb-4">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Bills</span>
              <span className="text-xs font-bold text-slate-200">{p.metrics.sponsoredCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Pass Rate</span>
              <span className="text-xs font-bold text-emerald-400">
                {p.metrics.passRate == null ? "N/A" : `${p.metrics.passRate}%`}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Public Appr.</span>
              <span className={`text-xs font-bold ${approvalDisplay === 'N/A' ? 'text-slate-400' : 'text-cyan-400'}`}>
                {approvalDisplay}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium group-hover:translate-x-1 transition-transform">
          <span>View Full Profile & Donors</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
  );
}