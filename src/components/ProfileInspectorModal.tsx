'use client';

import React from 'react';
import { Person } from '@/types';
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Heart,
  Briefcase,
  Compass,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { LinkedinIcon, InstagramIcon } from './BrandIcons';

interface ProfileInspectorModalProps {
  person: Person | null;
  onClose: () => void;
  onSelectAgentA?: (person: Person) => void;
  onSelectAgentB?: (person: Person) => void;
}

export const ProfileInspectorModal: React.FC<ProfileInspectorModalProps> = ({
  person,
  onClose,
  onSelectAgentA,
  onSelectAgentB,
}) => {
  if (!person) return null;

  const { analysis } = person;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#11131f] border border-white/10 shadow-2xl text-gray-200">
        {/* Top Header Banner */}
        <div className="relative h-32 sm:h-40 bg-gradient-to-r from-pink-600/30 via-violet-600/30 to-cyan-600/20 border-b border-white/10 p-6 flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Identity Verified (Two Sources)</span>
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300">
              ID: {person.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Identity Bar */}
        <div className="px-6 sm:px-8 -mt-16 pb-6 border-b border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end space-x-4">
              <div className="relative">
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-[#11131f] shadow-xl"
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1.5 rounded-full border-2 border-[#11131f]">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="mb-2">
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold text-white">{person.name}</h2>
                  <span className="text-xs text-gray-400 font-mono">{person.handle}</span>
                </div>
                <p className="text-sm text-pink-400 font-medium flex items-center space-x-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span>{analysis.profession}</span>
                </p>
              </div>
            </div>

            {/* Source Profile Links */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={person.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0a66c2]/20 hover:bg-[#0a66c2]/30 text-blue-300 border border-[#0a66c2]/40 text-xs font-medium transition-all"
              >
                <LinkedinIcon className="w-4 h-4 text-[#0a66c2]" />
                <span>LinkedIn Profile</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
              </a>

              <a
                href={person.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-medium transition-all"
              >
                <InstagramIcon className="w-4 h-4 text-pink-400" />
                <span>Instagram Profile</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
              </a>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-300 leading-relaxed max-w-3xl">
            {analysis.overallSummary}
          </p>

          <div className="mt-3 text-xs text-gray-400 flex items-center space-x-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{person.verificationNotes}</span>
          </div>
        </div>

        {/* Structured Profile Breakdown */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Grid of Attributes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interests & Topics */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>Observed Interests</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-pink-500/10 text-pink-300 border border-pink-500/20"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Hobbies & Leisure */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2 mb-3">
                <Compass className="w-4 h-4 text-violet-400" />
                <span>Hobbies & Creative Pursuits</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.hobbies.map((hobby, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20"
                  >
                    {hobby}
                  </span>
                ))}
              </div>
            </div>

            {/* Lifestyle Signals */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2 mb-3">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Lifestyle Signals</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {analysis.lifestyleSignals.map((signal, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Communication Style */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2 mb-3">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Communication Characteristics</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.communicationStyle.map((style, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stated Relationship Preferences & Unknowns */}
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
            <h3 className="text-sm font-semibold text-amber-300 flex items-center space-x-2 mb-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Stated Preferences & Public Limitations</span>
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Per strict privacy rules, DateMind AI never assumes private romantic intentions,
              sexual orientation, religion, or medical details. An absence of public information is
              never treated as a negative characteristic.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Publicly Stated Relationship Preferences:
                </span>
                <p className="text-xs text-gray-300 mt-1">
                  {analysis.statedRelationshipPreferences?.length
                    ? analysis.statedRelationshipPreferences.join(', ')
                    : 'None publicly stated (marked Unknown per policy)'}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Documented Unknowns:
                </span>
                <ul className="text-xs text-gray-400 mt-1 space-y-1">
                  {analysis.unknowns.map((unk, idx) => (
                    <li key={idx} className="flex items-center space-x-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{unk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Evidence Explorer & Attribution */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-pink-400" />
                <span>Verified Source Evidence Citations</span>
              </div>
              <span className="text-xs font-normal text-gray-400">
                {analysis.evidence.length} Cited Sources
              </span>
            </h3>

            <div className="space-y-2.5">
              {analysis.evidence.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{item.attribute}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          item.source === 'linkedin'
                            ? 'bg-[#0a66c2]/20 text-blue-300 border border-[#0a66c2]/30'
                            : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                        }`}
                      >
                        {item.source}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          item.confidence === 'high'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        {item.confidence} confidence
                      </span>
                    </div>
                    <p className="text-gray-300 italic">&ldquo;{item.supportingInformation}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              Agent ready to participate in Dating Arena simulations.
            </p>

            <div className="flex items-center space-x-2">
              {onSelectAgentA && (
                <button
                  onClick={() => {
                    onSelectAgentA(person);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-lg shadow-pink-600/30 transition-all"
                >
                  Set as Agent A in Arena
                </button>
              )}
              {onSelectAgentB && (
                <button
                  onClick={() => {
                    onSelectAgentB(person);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all"
                >
                  Set as Agent B in Arena
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
