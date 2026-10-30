import React from 'react';
import { ShieldCheck, Cpu, Heart, Sparkles, RefreshCw } from 'lucide-react';
import soundManager from '../services/soundManager';

export default function Footer({ onOpenAiModal }) {
  return (
    <footer className="relative z-20 bg-[#0B0F19] border-t border-[#A51F2B]/30 pt-12 pb-8 px-4 text-[#F4E4CC]/70 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        
        {/* Brand Column */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎈</span>
            <span className="font-['Cinzel'] font-bold text-lg text-[#F4E4CC]">
              IT'S PLAYTIME
            </span>
          </div>
          <p className="font-serif italic text-xs text-[#D6A56C]">
            "Every game has a dark side. Wanna play?"
          </p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            An advanced offline-first AI horror gaming platform designed with atmospheric original artwork, procedural soundscapes, and local inference.
          </p>
        </div>

        {/* Offline Architecture Column */}
        <div className="space-y-3">
          <h4 className="font-bold text-[#F4E4CC] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#66BB6A]" /> 100% Offline-First
          </h4>
          <ul className="space-y-1.5 text-[11px] text-gray-300">
            <li>• Progressive Web App (PWA)</li>
            <li>• Service Worker Asset Cache</li>
            <li>• IndexedDB Local Game Saves</li>
            <li>• Web Audio API Synthesizers</li>
            <li>• Zero CDN or External Runtime Lock</li>
          </ul>
        </div>

        {/* AI Inference Column */}
        <div className="space-y-3">
          <h4 className="font-bold text-[#F4E4CC] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Cpu size={14} className="text-[#60A5FA]" /> Open-Source AI
          </h4>
          <ul className="space-y-1.5 text-[11px] text-gray-300">
            <li>• Powered by Qwen 2.5 3B Instruct</li>
            <li>• Local Inference via Ollama</li>
            <li>• Curated Offline Fallback Banks</li>
            <li>• Zero Paid Proprietary API Calls</li>
            <li>
              <button 
                onClick={() => { soundManager.playClick(); onOpenAiModal(); }}
                className="text-[#D6A56C] underline hover:text-[#FFE4B5] mt-1"
              >
                View Local AI Setup Guide →
              </button>
            </li>
          </ul>
        </div>

        {/* Original Art & Disclaimer */}
        <div className="space-y-3">
          <h4 className="font-bold text-[#F4E4CC] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#D6A56C]" /> Original Universe
          </h4>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            All game mechanics, clown illustrations, carnival environments, storylines, and audio synthesizers are original creative works crafted specifically for IT's Playtime. No copyrighted movie footage or proprietary assets are used.
          </p>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400">
        <div>
          © {new Date().getFullYear()} IT's Playtime. You float, you play, you survive.
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-[#D6A56C]">
            Crafted for horror enthusiasts everywhere
          </span>
        </div>
      </div>
    </footer>
  );
}
