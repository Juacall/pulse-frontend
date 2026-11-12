import React, { useState, useEffect } from 'react';
import { Cpu, X, RefreshCw, Terminal, Database, Sparkles } from 'lucide-react';
import { DataResultDisplay } from './DataResultDisplay';
import { useAuth } from '../hooks/useAuth.js';
import { useAuthModal } from '../hooks/useAuthModal.js';

export function AiConsoleModal({ isOpen, onClose, onExecuteQuery, aiLoading, aiResult }) {
    const [queryInput, setQueryInput] = useState('');
    const { user } = useAuth();
    const { openAuthModal } = useAuthModal();

    // Close modal on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleRunQuery = (prompt) => {
        const targetQuery = prompt || queryInput;
        if (!targetQuery.trim()) return;
        if (!user) {
            openAuthModal('login');
            return;
        }
        if (prompt) setQueryInput(prompt);
        onExecuteQuery(targetQuery);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">

                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                            <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-base">RAG Query Console (DuckDB + Voyage AI)</h3>
                            <p className="text-xs text-slate-400">Simulates real-time pre-processing, vector distance search, & SQL execution.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sample Prompts */}
                <div className="mb-4 shrink-0">
                    <span className="text-xs font-semibold text-slate-400 block mb-2">Sample Prompts:</span>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleRunQuery("How many bills were sponsored by members from Washington state?")}
                            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-cyan-300 transition-colors"
                        >
                            WA State Sponsored Bills
                        </button>
                        <button
                            onClick={() => handleRunQuery("Summarize recent California forestry and fire protection legislation.")}
                            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-cyan-300 transition-colors"
                        >
                            California Wildfire Legislation
                        </button>
                    </div>
                </div>

                {/* Search Input Bar */}
                <div className="relative mb-4 shrink-0">
                    <input
                        type="text"
                        placeholder="Ask a question about congressional bills or members..."
                        value={queryInput}
                        onChange={(e) => setQueryInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRunQuery()}
                        className="w-full pl-4 pr-24 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                        onClick={() => handleRunQuery()}
                        disabled={aiLoading}
                        className="absolute right-2 top-2 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs transition-colors flex items-center space-x-1"
                    >
                        {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Execute</span>}
                    </button>
                </div>

                {/* Scrollable Response Container */}
                {aiResult && (
                    <div className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">

                        {/* Router Output Banner */}
                        {aiResult.routerAnalysis && (
                            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                                <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-1">
                                    <Terminal className="w-3.5 h-3.5" />
                                    <span>Pre-Processing Router Output</span>
                                </div>
                                <div className="text-slate-300 flex gap-4 mt-1">
                                    <div><span className="text-slate-500">Intent:</span> <span className="text-emerald-400 font-bold">{aiResult.routerAnalysis.intent}</span></div>
                                    <div><span className="text-slate-500">State Normalized:</span> <span className="text-cyan-300">{aiResult.routerAnalysis.detectedState}</span></div>
                                </div>
                            </div>
                        )}

                        {/* SQL Output Box */}
                        {aiResult.sqlQuery && (
                            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                                <div className="flex items-center space-x-2 text-blue-400 font-bold mb-1">
                                    <Database className="w-3.5 h-3.5" />
                                    <span>Executed SQL Query</span>
                                </div>
                                <pre className="font-mono text-[11px] text-slate-300 bg-slate-900 p-2 rounded border border-slate-800/80 overflow-x-auto">
                  {aiResult.sqlQuery}
                </pre>
                            </div>
                        )}

                        {/* Synthesized Output Box rendering DataResultDisplay */}
                        <div className="bg-gradient-to-br from-cyan-950/40 to-slate-950 p-4 rounded-xl border border-cyan-500/30 text-xs text-slate-200 leading-relaxed">
                            <div className="flex items-center space-x-2 text-cyan-300 font-bold mb-2">
                                <Sparkles className="w-4 h-4" />
                                <span>Synthesized AI Response</span>
                            </div>

                            {(() => {
                                // 1. Resolve nested payloads if wrapped
                                let payload = aiResult?.synthesizedAnswer ?? aiResult;

                                if (payload?.synthesizedAnswer) {
                                    payload = payload.synthesizedAnswer;
                                }

                                // 2. Parse stringified JSON if it arrived as a string
                                if (typeof payload === 'string' && payload.trim().startsWith('{')) {
                                    try {
                                        payload = JSON.parse(payload);
                                    } catch (e) {
                                        // Keep as raw string if JSON parsing fails
                                    }
                                }

                                // 3. Render DataResultDisplay if valid object with display_type
                                if (payload && typeof payload === 'object' && ('display_type' in payload || 'rows' in payload || 'summary' in payload)) {
                                    return <DataResultDisplay payload={payload} />;
                                }

                                // 4. Fallback rendering for standard text strings
                                return (
                                    <div className="whitespace-pre-wrap text-slate-300">
                                        {typeof payload === 'string' ? payload : JSON.stringify(payload)}
                                    </div>
                                );
                            })()}
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}