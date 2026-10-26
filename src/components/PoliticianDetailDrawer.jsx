import { X } from 'lucide-react';
import CampaignContributionSummary from './CampaignContributionSummary.jsx';
import KeySponsoredLegislation from './KeySponsoredLegislation.jsx';
import { MemberOverviewStats } from './MemberOverviewStats.jsx';
import { PoliticianActionButtons } from './PoliticianActionButtons.jsx';
import { VoteComponent } from './VoteComponent.jsx';
import { getMemberImageUrl } from '../utils/image';
import { partyBadgeClass } from '../utils/party';

const FALLBACK_MEMBER_IMAGE = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80";

export function PoliticianDetailDrawer({
                                           selectedPolitician,
                                           onClose,
                                           user,
                                           onVerifyIdentity,
                                           onVote,
                                           showToast
                                       }) {
    if (!selectedPolitician) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end overflow-x-hidden overflow-y-auto">
            <div className="box-border w-full max-w-3xl min-h-screen bg-slate-900 border-l border-slate-800 p-4 sm:p-6 flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300 overflow-x-hidden">

                {/* Close Button with z-10 priority */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors z-10"
                    aria-label="Close drawer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-full min-w-0">
                    {/* Header Area: pr-12 sm:pr-14 ensures content never collides with the close button on mobile */}
                    <div className="flex items-start space-x-4 mb-6 pt-2 pr-12 sm:pr-14 min-w-0">
                        <img
                            src={getMemberImageUrl(selectedPolitician.id, "225x275")}
                            alt={selectedPolitician.name}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_MEMBER_IMAGE;
                            }}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-lg flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white break-words">{selectedPolitician.name}</h2>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${partyBadgeClass(selectedPolitician.party)}`}>
                                    {selectedPolitician.party}
                                </span>
                            </div>
                            <p className="text-sm sm:text-base text-slate-400 mt-1">
                                {selectedPolitician.chamber} • {selectedPolitician.stateName} {selectedPolitician.district ? `(${selectedPolitician.district})` : ''}
                            </p>
                            {selectedPolitician.bio && (
                                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                                    {selectedPolitician.bio}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="w-full min-w-0 space-y-6">

                        {/* Action Buttons placed directly above MemberOverviewStats */}
                        <PoliticianActionButtons
                            memberId={selectedPolitician.id}
                            websiteUrl={selectedPolitician.website || selectedPolitician.websiteUrl}
                            campaignUrl={selectedPolitician.campaign || selectedPolitician.campaignUrl}
                        />

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
                            onStatsLoaded={onVote}
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