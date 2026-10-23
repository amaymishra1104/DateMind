'use client';

import React from 'react';
import { Flame, Users, UserPlus, Sparkles, Download, HeartHandshake } from 'lucide-react';

interface NavbarProps {
  activeTab: 'arena' | 'profiles' | 'ingest' | 'matchmaker' | 'dataset';
  setActiveTab: (tab: 'arena' | 'profiles' | 'ingest' | 'matchmaker' | 'dataset') => void;
  profileCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, profileCount }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090a0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('arena')}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-violet-600 shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform duration-200">
              <Flame className="w-5 h-5 text-white" />
              <div className="absolute -inset-1 rounded-xl bg-pink-500/20 blur group-hover:bg-pink-500/40 transition-all" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">DateMind</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-gray-400 tracking-wide font-medium">
                AGENTIC DATING PLATFORM
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('arena')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'arena'
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm shadow-pink-500/20'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-pink-400" />
              <span>Dating Arena</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('profiles')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'profiles'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm shadow-violet-500/20'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4 text-violet-400" />
              <span>Profiles Roster</span>
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-white/10 text-gray-300 font-mono">
                {profileCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('matchmaker')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'matchmaker'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Matchmaker</span>
            </button>

            <button
              onClick={() => setActiveTab('ingest')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'ingest'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Ingest New</span>
            </button>

            <button
              onClick={() => setActiveTab('dataset')}
              className={`flex items-center space-x-2 px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dataset'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title="Dataset Import/Export"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Dataset</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
