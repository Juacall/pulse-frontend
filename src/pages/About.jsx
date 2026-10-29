import React from 'react';
import {
    Database,
    Cpu,
    ShieldCheck,
    GitBranch,
    Sparkles,
    Scale,
    BarChart3,
    TrendingUp,
    ExternalLink
} from 'lucide-react';
import pulseBanner from '../assets/pulse-banner.jpg';

export function About() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
            {/* 1. Hero Banner with Image Asset */}
            <section className="relative w-full border-b border-slate-800 bg-slate-900/50 overflow-hidden">
                {/* Ambient Glow Backdrop */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

                <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center text-center relative z-10">
                    {/* Header Image Asset Container */}
                    <div className="w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-cyan-950/40 bg-slate-900 mb-8">
                        <img
                            src={pulseBanner}
                            alt="Pulse - Congressional & Election Analytics"
                            className="w-full h-auto object-cover object-center"
                        />
                    </div>

                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen Legislative Intelligence
          </span>

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
                        Democratizing Congressional Data & Campaign Finance
                    </h1>
                    <p className="mt-4 text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
                        LegiPulse bridges the gap between raw U.S. House & Senate activity and public transparency—delivering real-time legislative tracking, campaign fundraising insights, and AI-driven analysis.
                    </p>
                </div>
            </section>

            {/* 2. Platform Capabilities */}
            <section className="max-w-6xl mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold text-slate-100">Engineered for Open Democracy</h2>
                    <p className="text-sm text-slate-400 mt-2">Built on official public records to deliver unfiltered, non-partisan clarity.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition-colors flex flex-col">
                        <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-4">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-100 mb-2">Incumbent vs. Challenger Analytics</h3>
                        <p className="text-xs text-slate-400 leading-relaxed flex-1">
                            Compare sitting members of Congress against active election challengers side-by-side using legislative pass rates, roll-call attendance, and FEC fundraising metrics.
                        </p>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition-colors flex flex-col">
                        <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 mb-4">
                            <Scale className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-100 mb-2">Non-Partisan Transparency</h3>
                        <p className="text-xs text-slate-400 leading-relaxed flex-1">
                            Every data point is ingested directly from Congress.gov, the FEC, and official clerk records with zero algorithmic bias or partisan commentary.
                        </p>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition-colors flex flex-col">
                        <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-4">
                            <Cpu className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-100 mb-2">AI-Powered Natural Search</h3>
                        <p className="text-xs text-slate-400 leading-relaxed flex-1">
                            Ask complex legislative questions in plain English. Our RAG engine scans thousands of bill texts, donor records, and floor votes to synthesize instant answers.
                        </p>
                    </div>
                </div>
            </section>

            {/* 3. Tech Stack & Data Architecture */}
            <section className="border-t border-b border-slate-800/80 bg-slate-950/60 py-16">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="max-w-2xl mb-12">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-2">Tech Stack & Architecture</span>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100">High-Throughput Analytics Pipeline</h2>
                        <p className="text-sm text-slate-400 mt-2">
                            LegiPulse relies on modern data engineering practices to process politicians, bills and financial contributions.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                            <div className="flex items-center space-x-2 text-slate-300 font-semibold text-sm mb-2">
                                <Database className="w-4 h-4 text-cyan-400" />
                                <span>DuckDB & MotherDuck</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                In-memory columnar data engine executing analytical queries across thousands of politicians.
                            </p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                            <div className="flex items-center space-x-2 text-slate-300 font-semibold text-sm mb-2">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                <span>dbt Modeling</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Modular SQL transformation pipelines handling differential hash syncing, entity resolution, and candidate deduplication.
                            </p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                            <div className="flex items-center space-x-2 text-slate-300 font-semibold text-sm mb-2">
                                <GitBranch className="w-4 h-4 text-blue-400" />
                                <span>FastAPI & Redis</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Asynchronous Python microservices backed by distributed in-memory caching for lightning-fast REST responses.
                            </p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                            <div className="flex items-center space-x-2 text-slate-300 font-semibold text-sm mb-2">
                                <ShieldCheck className="w-4 h-4 text-amber-400" />
                                <span>Vite & Cloudflare</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Client-side React Single-Page Application deployed directly to a global edge CDN for sub-second page loads everywhere.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Official Data Sources Footer Callout */}
            <section className="max-w-6xl mx-auto px-6 py-16">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-100">Where does this data come from?</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                            LegiPulse periodically ingests public records from official federal repositories including Congress.gov (bills and roll-call votes), OpenFEC (campaign filings and donor contributions), and U.S. Census Bureau geospatial boundaries.
                        </p>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0">
                        <a
                            href="https://www.congress.gov"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-400 hover:text-cyan-300 border border-slate-700 bg-slate-950 px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-colors"
                        >
                            <span>Congress.gov</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                            href="https://www.fec.gov"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-400 hover:text-cyan-300 border border-slate-700 bg-slate-950 px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-colors"
                        >
                            <span>FEC.gov</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}