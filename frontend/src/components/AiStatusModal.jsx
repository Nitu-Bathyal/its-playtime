import React, { useState } from 'react';
import { 
  X, Cpu, Terminal, CheckCircle2, AlertTriangle, 
  ExternalLink, RefreshCw, ShieldCheck, Download
} from 'lucide-react';
import soundManager from '../services/soundManager';
import aiService from '../services/aiService';

export default function AiStatusModal({ aiStatus, onRefreshStatus, onClose }) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handlePingTest = async () => {
    soundManager.playClick();
    setIsTesting(true);
    setTestResult(null);

    const status = await aiService.checkStatus();
    setIsTesting(false);
    setTestResult(status);
    if (onRefreshStatus) {
      onRefreshStatus(status);
    }
  };

  const isConnected = aiStatus?.ollamaConnected && aiStatus?.modelAvailable;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl horror-card border border-[#D6A56C]/40 bg-[#111827] p-6 shadow-2xl rounded-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={() => { soundManager.playClick(); onClose(); }}
          className="absolute top-4 right-4 text-[#F4E4CC]/70 hover:text-white p-1 rounded-lg hover:bg-[#374151] transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#30213E] border border-[#A51F2B] flex items-center justify-center text-2xl shadow-inner">
            <Cpu className="text-[#93C5FD]" size={28} />
          </div>
          <div>
            <h2 className="font-['Cinzel'] font-bold text-2xl text-[#F4E4CC]">
              LOCAL AI ENGINE STATUS
            </h2>
            <p className="text-xs text-[#D6A56C]">
              Offline-First Open-Weight Architecture (Qwen 2.5 3B Instruct)
            </p>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`p-4 rounded-xl border mb-6 flex items-start gap-3 ${
          isConnected
            ? 'bg-[#132338] border-[#2563EB] text-[#93C5FD]'
            : 'bg-[#2A161E] border-[#A51F2B] text-[#FCA5A5]'
        }`}>
          {isConnected ? (
            <CheckCircle2 size={24} className="text-[#60A5FA] shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={24} className="text-[#EF4444] shrink-0 mt-0.5" />
          )}

          <div>
            <h3 className="font-bold text-base text-[#F4E4CC] mb-1">
              {isConnected
                ? `Local AI Active: ${aiStatus?.targetModel || 'qwen2.5:3b'}`
                : 'Local AI Offline: Using Built-In Curated Banks'}
            </h3>
            <p className="text-xs leading-relaxed opacity-90">
              {isConnected
                ? 'Connected directly to your local Ollama daemon. Stories, clues, and dialogue are generated on-device with zero internet!'
                : 'Ollama is not currently detected at http://localhost:11434. The platform is running smoothly using its rich prewritten horror branches, handcrafted riddles, and offline logic engines.'}
            </p>
          </div>
        </div>

        {/* Technical Distinction Explanation */}
        <div className="p-4 rounded-xl bg-[#1F2937]/70 border border-[#374151] mb-6 text-xs text-[#F4E4CC]/90 space-y-2">
          <h4 className="font-bold text-[#D6A56C] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#66BB6A]" /> Technical Note: Browser vs Native Model
          </h4>
          <p>
            Web browsers run in a secure sandbox and cannot autonomously download or run a 3GB LLM binary without a native local runtime.
          </p>
          <p>
            <strong>IT's Playtime NEVER makes paid proprietary API calls.</strong> When Ollama is running locally, the game connects directly via the local backend. When Ollama is absent, all 7 games remain 100% playable via our built-in offline horror library.
          </p>
        </div>

        {/* Setup Instructions */}
        <div className="space-y-4 mb-6">
          <h4 className="font-['Cinzel'] font-bold text-sm text-[#F4E4CC] tracking-wide flex items-center gap-2">
            <Terminal size={16} className="text-[#D6A56C]" />
            HOW TO ACTIVATE LOCAL QWEN 2.5 3B INFERENCE:
          </h4>

          {/* Step 1 */}
          <div className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B]">
            <div className="text-xs font-bold text-[#93C5FD] mb-1">
              Step 1: Install Ollama (Free & Open Source)
            </div>
            <p className="text-xs text-gray-400 mb-2">
              Download and run Ollama for Windows, Mac, or Linux:
            </p>
            <a 
              href="https://ollama.com" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#D6A56C] hover:text-[#FFE4B5] underline"
            >
              <span>https://ollama.com</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B]">
            <div className="text-xs font-bold text-[#93C5FD] mb-1">
              Step 2: Download & Run Qwen 2.5 3B Instruct
            </div>
            <p className="text-xs text-gray-400 mb-2">
              Open your PowerShell / Terminal and run this one-time command:
            </p>
            <div className="bg-[#030712] p-2.5 rounded font-mono text-xs text-[#4ADE80] border border-[#22C55E]/20 select-all">
              ollama run qwen2.5:3b
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B]">
            <div className="text-xs font-bold text-[#93C5FD] mb-1">
              Step 3: Start the IT's Playtime Python Backend
            </div>
            <div className="bg-[#030712] p-2.5 rounded font-mono text-xs text-[#FFE4B5] border border-[#D6A56C]/20 select-all">
              cd backend &amp;&amp; python app.py
            </div>
          </div>
        </div>

        {/* Action Button: Ping Test */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePingTest}
            disabled={isTesting}
            className="btn-horror flex-1 py-3 text-sm flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} className={isTesting ? "animate-spin" : ""} />
            <span>{isTesting ? 'TESTING LOCAL DAEMON...' : 'PING LOCAL OLLAMA'}</span>
          </button>

          <button
            onClick={() => { soundManager.playClick(); onClose(); }}
            className="btn-horror-outline px-6 py-3 text-sm"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
