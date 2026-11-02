// src/components/PoliticianActionButtons.jsx
import React from 'react';

// src/components/PoliticianActionButtons.jsx

const formatUrl = (rawUrl) => {
    if (!rawUrl) return null;

    // 1. Unwrap real JS arrays if passed directly
    let target = Array.isArray(rawUrl) ? rawUrl[0] : rawUrl;

    if (!target) return null;

    // 2. Strip stringified array brackets [ ], quotes ' ", and extra whitespace
    let clean = String(target)
        .trim()
        .replace(/^\[|\]$/g, '')   // Strip leading/trailing array brackets [ and ]
        .replace(/^["']|["']$/g, '') // Strip leading/trailing quotes
        .replace(/^\[|\]$/g, '')   // Handle nested stringified brackets
        .trim();

    if (
        !clean ||
        clean === '#' ||
        clean.toLowerCase() === 'null' ||
        clean.toLowerCase() === 'undefined' ||
        clean.toLowerCase().startsWith('about:blank')
    ) {
        return null;
    }

    // 3. Ensure leading protocol (only if not already present)
    if (!/^https?:\/\//i.test(clean)) {
        clean = `https://${clean}`;
    }

    // 4. Validate & parse using native URL constructor
    try {
        const parsed = new URL(clean);
        if (!parsed.hostname || !parsed.hostname.includes('.')) {
            return null;
        }
        return parsed.href;
    } catch {
        if (clean.startsWith('https://') || clean.startsWith('http://')) {
            return clean;
        }
        return null;
    }
};
export function PoliticianActionButtons({
                                            memberId,
                                            websiteUrl,  // Official .gov URL (can be string or ['https://...'])
                                            campaignUrl  // Official campaign URL
                                        }) {
    console.log(websiteUrl)
    console.log(campaignUrl)
    const officialGovUrl = formatUrl(websiteUrl);
    const officialCampaignUrl = formatUrl(campaignUrl)
    console.log(officialGovUrl)
    console.log(officialCampaignUrl)

    const trackClick = (buttonType, destinationUrl) => {
        const API_BASE_URL = import.meta.env.VITE_API_URL || '';
        const payload = JSON.stringify({
            bioguide_id: memberId,
            button_type: buttonType,
            destination_url: destinationUrl,
        });

        if (navigator.sendBeacon) {
            const blob = new Blob([payload], { type: 'application/json' });
            navigator.sendBeacon(`${API_BASE_URL}/api/telemetry/click`, blob);
        } else {
            fetch(`${API_BASE_URL}/api/telemetry/click`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                keepalive: true,
            }).catch(console.error);
        }
    };

    if (!officialGovUrl && !officialCampaignUrl) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Official .gov Button */}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            )}

            {/* Support Campaign Button */}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            )}
        </div>
    );
}