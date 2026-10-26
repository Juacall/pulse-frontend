import React from 'react';

export function PoliticianActionButtons({
                                            memberId,
                                            websiteUrl,  // Official .gov URL
                                            campaignUrl  // Official campaign URL from OpenFEC
                                        }) {
    // Cleans URL and returns null if string is empty, null, or undefined
    const formatUrl = (url) => {
        if (!url || typeof url !== 'string') return null;
        const clean = url.trim();
        if (!clean) return null;

        return clean.toLowerCase().startsWith('http://') || clean.toLowerCase().startsWith('https://')
            ? clean
            : `https://${clean}`;
    };

    const officialGovUrl = formatUrl(websiteUrl);
    const officialCampaignUrl = formatUrl(campaignUrl);

    const trackClick = (buttonType, destinationUrl) => {
        const payload = JSON.stringify({
            bioguide_id: memberId,
            button_type: buttonType,
            destination_url: destinationUrl,
        });
        console.log(payload)
        if (navigator.sendBeacon) {
            const blob = new Blob([payload], { type: 'application/json' });
            navigator.sendBeacon('/api/telemetry/click', blob);
        } else {
            fetch('/api/telemetry/click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                keepalive: true,
            }).catch(console.error);
        }
    };

    // Entire component renders nothing if neither URL exists
    if (!officialGovUrl && !officialCampaignUrl) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* 1. Official .gov Button - Hidden if websiteUrl is missing/null */}
            {officialGovUrl && (
                <a
                    href={officialGovUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick('official_gov', officialGovUrl)}
                    className="inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm rounded-xl transition-all shadow-sm"
                >
                    <span>Official Site (.gov)</span>
                    <svg className="w-3.5 h-3.5 ml-1.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            )}

            {/* 2. Support Campaign Button - Hidden if campaignUrl is missing/null */}
            {officialCampaignUrl && (
                <a
                    href={officialCampaignUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick('campaign_url', officialCampaignUrl)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-md"
                >
                    <span>Support Campaign</span>
                    <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            )}
        </div>
    );
}