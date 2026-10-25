import { X } from 'lucide-react';
import CampaignContributionSummary from './CampaignContributionSummary.jsx';
import KeySponsoredLegislation from './KeySponsoredLegislation.jsx';
import { MemberOverviewStats } from './MemberOverviewStats.jsx';
import { VoteComponent } from './VoteComponent.jsx';
import { getMemberImageUrl } from '../utils/image';
import { partyBadgeClass } from '../utils/party';

const FALLBACK_MEMBER_IMAGE = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80";

export function PoliticianDetailDrawer({
                                           selectedPolitician,
                                           onClose,
                                           user,
                                           onVerifyIdentity,
                                           onVote,// 👈 Accept handleVote from parent (e.g. App.jsx or Dashboard)
                                           showToast
                                       }) {
    if (!selectedPolitician) return null;

    // Use handleVote if passed, otherwise fall back to onVote
    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end overflow-x-hidden overflow-y-auto">
            <div className="box-border w-full max-w-3xl min-h-screen bg-slate-900 border-l border-slate-800 p-4 sm:p-6 flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300 overflow-x-hidden">

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-full min-w-0">
                    <div className="flex items-start space-x-4 mb-6 pt-2 min-w-0">
                        <img
                            src={getMemberImageUrl(selectedPolitician.id, "225x275")}
                            alt={selectedPolitician.name}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_MEMBER_IMAGE;
                            }}
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-lg"
                        />
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-3xl font-bold text-white break-words">{selectedPolitician.name}</h2>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${partyBadgeClass(selectedPolitician.party)}`}>
                  {selectedPolitician.party}
                </span>
                            </div>
                            <p className="text-base text-slate-400 mt-1">
                                {selectedPolitician.chamber} • {selectedPolitician.stateName} ({selectedPolitician.district})
                            </p>
                            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                                {selectedPolitician.bio}
                            </p>
                        </div>
                    </div>

                    <div className="w-full min-w-0 space-y-6">

                        <MemberOverviewStats politician={selectedPolitician} />

                        {/* PUBLIC OPINION & VERIFIED SENTIMENT */}
                        <VoteComponent
                            key={selectedPolitician.id}
                            politicianId={selectedPolitician.id}
                            selectedPolitician={selectedPolitician}
                            user={user}
                            onVerifyIdentity={onVerifyIdentity}
                            onVote={onVote}
                            showToast={showToast}
                            onStatsLoaded={onVote} // 👈 Calls syncVoteStats cleanly without ReferenceError
                        />

                        <CampaignContributionSummary
                            key={selectedPolitician.id}
                            politicianId={selectedPolitician.id}
                        />

                        <KeySponsoredLegislation
                            key={selectedPolitician.id}
                            bioguideId={selectedPolitician.id}
                        />

                    </div>
                </div>

            </div>
        </div>
    );
}

export default PoliticianDetailDrawer;