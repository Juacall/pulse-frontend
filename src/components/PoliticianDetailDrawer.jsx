// src/components/PoliticianDetailDrawer.jsx
import React, { useState } from 'react';
import { User, FileText, DollarSign, X } from 'lucide-react';

// Sub-components
import { MemberOverviewStats } from './MemberOverviewStats';
import { CampaignContributionSummary } from './CampaignContributionSummary';
import { KeySponsoredLegislation } from './KeySponsoredLegislation';
import { LegislativeTrackRecordTab } from './LegislativeTrackRecord';
import { PoliticianActionButtons } from './PoliticianActionButtons';
import { VoteComponent } from './VoteComponent';

export function PoliticianDetailDrawer({
                                           selectedPolitician,
                                           politician: politicianProp,
                                           user,
                                           onVote,
                                           onClose
                                       }) {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'legislative' | 'finance'

    // Support either prop name passed by parent components
    const politician = selectedPolitician || politicianProp;
    const isOpen = Boolean(politician);

    if (!isOpen || !politician) return null;

    const bioguideId = politician.bioguide_id || politician.id;
    const isIncumbent = politician.is_incumbent ?? (String(politician.status).toLowerCase() === 'incumbent');

    // Extract website & campaign URLs across camelCase and snake_case API payloads
    const websiteUrl = politician.website_url || politician.websiteUrl || politician.website;
    const campaignUrl = politician.campaign_url || politician.campaignUrl;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end">
            <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col justify-between overflow-hidden">

                {/* 1. Header & Candidate Info */}
                <div className="p-6 border-b border-slate-800 bg-slate-950/60 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold overflow-hidden">
                                {politician.image_url || politician.imageUrl ? (
                                    <img
                                        src={politician.image_url || politician.imageUrl}
                                        alt={politician.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-6 h-6 text-slate-400" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-white">{politician.name}</h2>
                                <p className="text-xs font-semibold text-slate-400">
                  <span className={politician.party === 'DEM' || politician.party === 'Democratic' ? 'text-blue-400' : 'text-red-400'}>
                    {politician.party}
                  </span>
                                    {' • '}
                                    <span>{politician.state}-{politician.district || 'At-Large'}</span>
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Telemetry-tracked Action Buttons (.gov Website & Campaign Support Links) */}
                    <PoliticianActionButtons
                        memberId={bioguideId}
                        websiteUrl={websiteUrl}
                        campaignUrl={campaignUrl}
                    />
                </div>

                {/* 2. Sub-Navigation Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-950 px-6 shrink-0">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors flex items-center space-x-2 ${
                            activeTab === 'overview'
                                ? 'border-cyan-500 text-cyan-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <User className="w-3.5 h-3.5" />
                        <span>Overview</span>
                    </button>

                    {isIncumbent && (
                        <button
                            onClick={() => setActiveTab('legislative')}
                            className={`py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors flex items-center space-x-2 ${
                                activeTab === 'legislative'
                                    ? 'border-cyan-500 text-cyan-400'
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Legislative Track Record</span>
                        </button>
                    )}

                    <button
                        onClick={() => setActiveTab('finance')}
                        className={`py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors flex items-center space-x-2 ${
                            activeTab === 'finance'
                                ? 'border-cyan-500 text-cyan-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Campaign Finance</span>
                    </button>
                </div>

                {/* 3. Tab Body Container */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                    {activeTab === 'overview' && (
                        <>
                            <MemberOverviewStats politician={politician} />

                            <VoteComponent
                                politicianId={bioguideId}
                                selectedPolitician={politician}
                                user={user}
                                onVote={onVote}
                            />

                            <KeySponsoredLegislation bioguideId={bioguideId} />
                        </>
                    )}

                    {activeTab === 'legislative' && isIncumbent && (
                        <LegislativeTrackRecordTab politicianId={bioguideId} />
                    )}

                    {activeTab === 'finance' && (
                        <CampaignContributionSummary politicianId={bioguideId} />
                    )}
                </div>

            </div>
        </div>
    );
}