import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { fetchMemberBills } from "../api.js";

function getBillsResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.bills)) return data.bills;
  if (Array.isArray(data?.results)) return data.results;
  return null;
}

function getBillId(bill) {
  return bill.id ?? bill.billId ?? bill.bill_id ?? bill.number ?? "Bill";
}

function getBillStatus(bill) {
  return bill.status ?? bill.latestAction ?? bill.latest_action ?? "Status unavailable";
}

function getBillDate(bill) {
  return bill.date ?? bill.introducedDate ?? bill.introduced_date ?? "Date unavailable";
}

export default function KeySponsoredLegislation({ bioguideId }) {
  const [request, setRequest] = useState({ bioguideId: null, status: "loading", bills: [] });
  const isCurrentMember = request.bioguideId === bioguideId;
  const status = isCurrentMember ? request.status : "loading";
  const bills = isCurrentMember ? request.bills : [];

  useEffect(() => {
    let isCurrentRequest = true;

    fetchMemberBills(bioguideId)
        .then((result) => {
          if (!isCurrentRequest) return;

          const fetchedBills = getBillsResponse(result);
          if (fetchedBills === null) {
            throw new Error("The key bills endpoint returned an unexpected response.");
          }
          setRequest({ bioguideId, status: "loaded", bills: fetchedBills });
        })
        .catch((error) => {
          if (!isCurrentRequest) return;
          console.error(`Error loading key sponsored legislation for ${bioguideId}:`, error);
          setRequest({ bioguideId, status: "error", bills: [] });
        });

    return () => {
      isCurrentRequest = false;
    };
  }, [bioguideId]);

  // 1. Return null to hide the component entirely if loaded with no bills or on error
  if (status === "error" || (status === "loaded" && bills.length === 0)) {
    return null;
  }

  return (
      <section className="w-full min-w-0 bg-slate-950 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-base font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Key Sponsored Legislation</span>
        </h3>
        {status === "loading" ? (
            <p className="text-sm text-slate-400" role="status">Loading sponsored legislation…</p>
        ) : (
            <div className="space-y-3">
              {bills.map((bill, index) => (
                  <div
                      key={`${getBillId(bill)}-${index}`}
                      className="min-w-0 bg-slate-900 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="text-sm font-bold text-cyan-300 break-words mb-1.5">
                      {getBillId(bill)}
                    </div>
                    <p className="text-sm text-slate-200 font-medium break-words">
                      {bill.title ?? "Title unavailable"}
                    </p>
                    <dl className="mt-3 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-2 gap-y-1 rounded-lg border border-slate-800/80 bg-slate-950/60 p-2 text-xs">
                      <dt className="text-slate-500">Status</dt>
                      <dd className="min-w-0 text-slate-300 break-words">{getBillStatus(bill)}</dd>
                      <dt className="text-slate-500">Introduced</dt>
                      <dd className="min-w-0 text-slate-300 break-words">{getBillDate(bill)}</dd>
                    </dl>
                  </div>
              ))}
            </div>
        )}
      </section>
  );
}