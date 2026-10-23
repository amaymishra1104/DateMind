'use client';

import React, { useState, useEffect } from 'react';
import { Person } from '@/types';
import { INITIAL_ROSTER } from '@/data/roster';
import { Navbar } from '@/components/Navbar';
import { DatingArena } from '@/components/DatingArena';
import { ProfilesRoster } from '@/components/ProfilesRoster';
import { IngestPerson } from '@/components/IngestPerson';
import { MatchmakerMatrix } from '@/components/MatchmakerMatrix';
import { DatasetManager } from '@/components/DatasetManager';
import { ProfileInspectorModal } from '@/components/ProfileInspectorModal';
import { Sparkles, ShieldCheck, HeartHandshake, Flame } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'arena' | 'profiles' | 'ingest' | 'matchmaker' | 'dataset'>('arena');
  const [profiles, setProfiles] = useState<Person[]>(INITIAL_ROSTER);
  const [selectedAgentA, setSelectedAgentA] = useState<Person | null>(INITIAL_ROSTER[3] || null); // Mira Murati
  const [selectedAgentB, setSelectedAgentB] = useState<Person | null>(INITIAL_ROSTER[5] || null); // Lex Fridman
  const [selectedAnchorPerson, setSelectedAnchorPerson] = useState<Person | null>(INITIAL_ROSTER[0] || null);
  const [inspectedPerson, setInspectedPerson] = useState<Person | null>(null);

  // Load latest profiles from API on mount
  useEffect(() => {
    fetch('/api/profiles')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setProfiles(data.data);
          if (!selectedAgentA) setSelectedAgentA(data.data[0]);
          if (!selectedAgentB && data.data.length > 1) setSelectedAgentB(data.data[1]);
          if (!selectedAnchorPerson) setSelectedAnchorPerson(data.data[0]);
        }
      })
      .catch(err => console.warn('Could not load profiles from API, using initial roster:', err));
  }, []);

  const refreshProfiles = () => {
    fetch('/api/profiles')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setProfiles(data.data);
        }
      });
  };

  const handleProfileCreated = (newPerson: Person) => {
    setProfiles(prev => [newPerson, ...prev.filter(p => p.id !== newPerson.id)]);
  };

  const handleSendToArena = (newPerson: Person) => {
    setSelectedAgentA(newPerson);
    // Pick another person for Agent B
    const other = profiles.find(p => p.id !== newPerson.id) || profiles[0];
    setSelectedAgentB(other);
    setActiveTab('arena');
  };

  const handleLaunchArenaMatch = (personA: Person, personB: Person) => {
    setSelectedAgentA(personA);
    setSelectedAgentB(personB);
    setActiveTab('arena');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-gray-100">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profileCount={profiles.length}
      />

      {/* Hero Header Banner */}
      <div className="relative border-b border-white/10 bg-gradient-to-b from-pink-950/20 via-[#0d0f1a] to-[#090a0f] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-medium text-pink-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autonomous AI Dating Simulation &amp; Compatibility Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Every Person Represented by an <span className="gradient-text">AI Agent</span>.
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl">
              Analyzes verified public LinkedIn &amp; Instagram profiles, constructs strictly
              traceable evidence personas, and simulates real 5-round dating conversations.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-4 py-3 rounded-xl glass-panel border border-white/10 text-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                Verified Roster
              </span>
              <span className="text-xl font-bold text-white">{profiles.length} People</span>
            </div>
            <div className="px-4 py-3 rounded-xl glass-panel border border-white/10 text-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                Permitted Sources
              </span>
              <span className="text-xl font-bold text-pink-400">2 (LI + IG)</span>
            </div>
            <div className="px-4 py-3 rounded-xl glass-panel border border-white/10 text-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                LLM Engine
              </span>
              <span className="text-xl font-bold text-violet-400">Groq Fast</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'arena' && (
          <DatingArena
            profiles={profiles}
            selectedAgentA={selectedAgentA}
            selectedAgentB={selectedAgentB}
            setSelectedAgentA={setSelectedAgentA}
            setSelectedAgentB={setSelectedAgentB}
            onInspectProfile={person => setInspectedPerson(person)}
          />
        )}

        {activeTab === 'profiles' && (
          <ProfilesRoster
            profiles={profiles}
            onInspectProfile={person => setInspectedPerson(person)}
            onSelectAgentA={person => {
              setSelectedAgentA(person);
              setActiveTab('arena');
            }}
            onSelectAgentB={person => {
              setSelectedAgentB(person);
              setActiveTab('arena');
            }}
            onViewMatchmaker={person => {
              setSelectedAnchorPerson(person);
              setActiveTab('matchmaker');
            }}
          />
        )}

        {activeTab === 'ingest' && (
          <IngestPerson
            onProfileCreated={handleProfileCreated}
            onSendToArena={handleSendToArena}
          />
        )}

        {activeTab === 'matchmaker' && (
          <MatchmakerMatrix
            profiles={profiles}
            selectedAnchorPerson={selectedAnchorPerson}
            onSelectAnchorPerson={setSelectedAnchorPerson}
            onLaunchArenaMatch={handleLaunchArenaMatch}
            onInspectProfile={person => setInspectedPerson(person)}
          />
        )}

        {activeTab === 'dataset' && (
          <DatasetManager
            profiles={profiles}
            onProfilesUpdated={refreshProfiles}
          />
        )}
      </main>

      {/* Profile Inspector Modal */}
      <ProfileInspectorModal
        person={inspectedPerson}
        onClose={() => setInspectedPerson(null)}
        onSelectAgentA={person => {
          setSelectedAgentA(person);
          setActiveTab('arena');
        }}
        onSelectAgentB={person => {
          setSelectedAgentB(person);
          setActiveTab('arena');
        }}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#07080c] py-6 px-4 sm:px-6 lg:px-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-pink-500" />
            <span className="font-semibold text-gray-300">DateMind AI</span>
            <span>— Agentic Dating Platform</span>
          </div>

          <div className="text-center sm:text-right">
            <span>Built with Next.js App Router, TypeScript, Tailwind CSS, &amp; Groq AI.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
