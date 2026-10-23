'use client';

import React, { useState } from 'react';
import { Person } from '@/types';
import {
  Search,
  ShieldCheck,
  Briefcase,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import { LinkedinIcon, InstagramIcon } from './BrandIcons';

interface ProfilesRosterProps {
  profiles: Person[];
  onInspectProfile: (person: Person) => void;
  onSelectAgentA: (person: Person) => void;
  onSelectAgentB: (person: Person) => void;
  onViewMatchmaker: (person: Person) => void;
}

export const ProfilesRoster: React.FC<ProfilesRosterProps> = ({
  profiles,
  onInspectProfile,
  onSelectAgentA,
  onSelectAgentB,
  onViewMatchmaker,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filtered = profiles.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.handle.toLowerCase().includes(q) ||
      p.analysis.profession.toLowerCase().includes(q) ||
      p.analysis.interests.some(i => i.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterCategory === 'all') return true;
    if (filterCategory === 'ai')
      return (
        p.analysis.profession.toLowerCase().includes('ai') ||
        p.analysis.interests.some(i => i.toLowerCase().includes('ai') || i.toLowerCase().includes('neural'))
      );
    if (filterCategory === 'founders')
      return (
        p.analysis.profession.toLowerCase().includes('founder') ||
        p.analysis.profession.toLowerCase().includes('ceo')
      );
    if (filterCategory === 'creators')
      return (
        p.analysis.profession.toLowerCase().includes('creator') ||
        p.analysis.profession.toLowerCase().includes('host') ||
        p.analysis.profession.toLowerCase().includes('journalist')
      );
    if (filterCategory === 'design')
      return (
        p.analysis.profession.toLowerCase().includes('design') ||
        p.analysis.interests.some(i => i.toLowerCase().includes('design'))
      );

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Verified Profiles Roster</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {profiles.length} Real People Verified
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Every person is cross-verified across public LinkedIn and Instagram accounts with
              strictly traceable evidence items.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, role, interest..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-all"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <span className="text-xs text-gray-400 mr-2">Filter:</span>
          {[
            { id: 'all', label: 'All Profiles' },
            { id: 'founders', label: 'CEOs & Founders' },
            { id: 'ai', label: 'AI Researchers & Leaders' },
            { id: 'creators', label: 'Creators & Journalists' },
            { id: 'design', label: 'Design & Product' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterCategory === cat.id
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(person => (
          <div
            key={person.id}
            className="group rounded-2xl glass-panel border border-white/10 hover:border-pink-500/30 p-5 shadow-lg hover:shadow-pink-500/10 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start space-x-3.5 mb-3">
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-14 h-14 rounded-xl object-cover border border-white/10 group-hover:border-pink-500/40 transition-colors shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <h3 className="text-sm font-bold text-white truncate">{person.name}</h3>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-xs text-pink-400 font-medium truncate mt-0.5">
                    {person.analysis.profession}
                  </p>
                  <span className="text-[10px] text-gray-400 font-mono block truncate">
                    {person.handle}
                  </span>
                </div>
              </div>

              {/* Source Link Badges */}
              <div className="flex items-center space-x-2 my-3">
                <a
                  href={person.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#0a66c2]/15 text-[#38bdf8] border border-[#0a66c2]/30 text-[10px] hover:bg-[#0a66c2]/25 transition-colors"
                >
                  <LinkedinIcon className="w-3 h-3 text-[#0a66c2]" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                </a>

                <a
                  href={person.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 px-2 py-0.5 rounded bg-pink-500/15 text-pink-300 border border-pink-500/30 text-[10px] hover:bg-pink-500/25 transition-colors"
                >
                  <InstagramIcon className="w-3 h-3 text-pink-400" />
                  <span>Instagram</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                </a>

                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Verified
                </span>
              </div>

              {/* Summary Snippet */}
              <p className="text-xs text-gray-300 line-clamp-2 mb-3">
                {person.analysis.overallSummary}
              </p>

              {/* Interests Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {person.analysis.interests.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/5"
                  >
                    {item}
                  </span>
                ))}
                {person.analysis.interests.length > 3 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded text-gray-500">
                    +{person.analysis.interests.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => onInspectProfile(person)}
                  className="text-pink-400 hover:text-pink-300 font-medium flex items-center space-x-1"
                >
                  <span>Inspect Profile &amp; Evidence</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onViewMatchmaker(person)}
                  className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Match Rankings</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onSelectAgentA(person)}
                  className="px-2.5 py-1.5 rounded-lg bg-pink-500/15 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-[11px] font-semibold transition-all text-center"
                >
                  Set as Agent A
                </button>
                <button
                  onClick={() => onSelectAgentB(person)}
                  className="px-2.5 py-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 text-[11px] font-semibold transition-all text-center"
                >
                  Set as Agent B
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
