import { useEffect, useState } from "react";
import { Building2, DollarSign } from "lucide-react";
import { fetchPoliticianDonationSummary, fetchPoliticianDonors } from "../api.js";

const loadingState = {
  summaryStatus: "loading",
  donorsStatus: "loading",
  summary: null,
  donors: []
};

function formatContributionAmount(amount) {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "Unavailable";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
}

export function CampaignContributionSummary({ politicianId }) {
  const [campaignData, setCampaignData] = useState({
    politicianId: null,
    ...loadingState
  });
  const isCurrentPolitician = campaignData.politicianId === politicianId;
  const data = isCurrentPolitician ? campaignData : loadingState;

  useEffect(() => {
    let isCurrent = true;

    Promise.allSettled([
      fetchPoliticianDonationSummary(politicianId),
      fetchPoliticianDonors(politicianId, 2026)
    ]).then(([summaryResult, donorsResult]) => {
      if (!isCurrent) return;

      setCampaignData({
        politicianId,
        summaryStatus: summaryResult.status === "fulfilled" && summaryResult.value
          ? "loaded"
          : "unavailable",
        donorsStatus: donorsResult.status === "fulfilled" && Array.isArray(donorsResult.value)
          ? "loaded"
          : "unavailable",
        summary: summaryResult.status === "fulfilled" ? summaryResult.value : null,
        donors: donorsResult.status === "fulfilled" && Array.isArray(donorsResult.value)
          ? donorsResult.value
          : []
      });
    });

    return () => {
      isCurrent = false;
    };
  }, [politicianId]);

  const summaryCards = [
    ["Total Receipts", data.summary?.totalReceipts],
    ["PAC Contributions", data.summary?.pacContributions],
    ["Individual Contributions", data.summary?.individualContributions],
    ["Coverage Through", data.summary?.coverageEndDate]
  ];

  return (
    <>
      <section className="w-full min-w-0 bg-slate-950 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-base font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Campaign Contribution Summary</span>
        </h3>
        {data.summaryStatus === "loading" ? (
          <p className="text-sm text-slate-400" role="status">Loading contribution summary…</p>
        ) : data.summaryStatus === "unavailable" ? (
          <p className="text-sm text-amber-300 mb-3" role="status">
            Contribution summary unavailable.
          </p>
        ) : null}
        <dl className="grid grid-cols-2 gap-2">
          {summaryCards.map(([label, value]) => (
            <div key={label} className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
              <dt className="text-xs text-slate-500 uppercase font-medium">{label}</dt>
              <dd className="text-sm font-bold text-slate-200 mt-1">
                {data.summaryStatus === "loading"
                  ? "Loading…"
                  : label === "Coverage Through"
                    ? value || "Unavailable"
                    : formatContributionAmount(value)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="w-full min-w-0 bg-slate-950 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-base font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span>Top Donors</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Employer-grouped contribution totals, not individual donors (2026 cycle).
        </p>
        {data.donorsStatus === "loading" ? (
          <p className="text-sm text-slate-400" role="status">Loading top donors…</p>
        ) : data.donorsStatus === "unavailable" ? (
          <p className="text-sm text-amber-300" role="status">Top donor data unavailable.</p>
        ) : data.donors.length === 0 ? (
          <p className="text-sm text-slate-500">
            No donor rows are available to display; this does not indicate that no contributions were received.
          </p>
        ) : (
          <div className="space-y-2.5">
            {data.donors.map((donor, index) => (
              <div
                key={`${donor.donorName}-${index}`}
                className="flex min-w-0 items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800/80"
              >
                <div className="flex min-w-0 items-center space-x-3">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-200 break-words">{donor.donorName}</div>
                    {donor.industry && (
                      <div className="text-xs text-slate-400 break-words">{donor.industry}</div>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-sm font-extrabold text-emerald-400">
                  {formatContributionAmount(donor.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
