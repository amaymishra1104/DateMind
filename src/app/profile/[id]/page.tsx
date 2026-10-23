import React from 'react';
import Link from 'next/link';
import { DataStore } from '@/lib/storage';
import { notFound } from 'next/navigation';
import {
  LinkedinIcon,
  InstagramIcon,
} from '@/components/BrandIcons';

export function generateStaticParams() {
  const profiles = DataStore.getProfiles();
  return profiles.map((p) => ({ id: p.id }));
}
import {
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  Sparkles,
  Compass,
  Heart,
  MessageSquare,
  HelpCircle,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const person = DataStore.getProfileById(id);

  if (!person) {
    notFound();
  }

  const { analysis } = person;

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to DateMind AI Platform</span>
        </Link>

        {/* Profile Card Header */}
        <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-2xl">
          <div className="h-36 sm:h-44 bg-gradient-to-r from-pink-600/30 via-violet-600/30 to-cyan-600/20 p-6 flex justify-between items-start">
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Identity Verified (Two Sources)</span>
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-black/40 text-gray-300 font-mono">
              ID: {person.id}
            </span>
          </div>

          <div className="px-6 sm:px-8 -mt-16 pb-8 border-b border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-end space-x-4">
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-[#11131f] shadow-xl"
                />
                <div className="mb-2">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-white">{person.name}</h1>
                    <span className="text-xs text-gray-400 font-mono">{person.handle}</span>
                  </div>
                  <p className="text-sm text-pink-400 font-medium flex items-center space-x-1.5 mt-0.5">
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
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#0a66c2]/20 hover:bg-[#0a66c2]/30 text-blue-300 border border-[#0a66c2]/40 text-xs font-medium transition-all"
                >
                  <LinkedinIcon className="w-4 h-4 text-[#0a66c2]" />
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                </a>

                <a
                  href={person.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-medium transition-all"
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

          {/* Breakdown Section */}
          <div className="p-6 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Interests */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                <h2 className="text-sm font-semibold text-white flex items-center space-x-2 mb-3">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>Observed Interests</span>
                </h2>
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

              {/* Hobbies */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                <h2 className="text-sm font-semibold text-white flex items-center space-x-2 mb-3">
                  <Compass className="w-4 h-4 text-violet-400" />
                  <span>Hobbies &amp; Creative Pursuits</span>
                </h2>
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
                <h2 className="text-sm font-semibold text-white flex items-center space-x-2 mb-3">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Lifestyle Signals</span>
                </h2>
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
                <h2 className="text-sm font-semibold text-white flex items-center space-x-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Communication Style</span>
                </h2>
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

            {/* Stated Preferences & Documented Unknowns */}
            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <h2 className="text-sm font-semibold text-amber-300 flex items-center space-x-2 mb-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Stated Preferences &amp; Public Unknowns</span>
              </h2>
              <p className="text-xs text-gray-400 mb-3">
                DateMind AI never invents relationship preferences or assumes private romantic intentions.
                An absence of public information is never treated as a negative characteristic.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Stated Relationship Preferences:
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

            {/* Evidence Explorer */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400" />
                  <span>Verified Source Evidence Citations</span>
                </div>
                <span className="text-xs font-normal text-gray-400">
                  {analysis.evidence.length} Cited Sources
                </span>
              </h2>

              <div className="space-y-2.5">
                {analysis.evidence.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
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
                      <p className="text-gray-300 italic">
                        &ldquo;{item.supportingInformation}&rdquo;
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
