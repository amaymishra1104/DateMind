'use client';

import React, { useState, useEffect } from 'react';
import { Person, CompatibilityRanking } from '@/types';
import { PairMatch } from '@/lib/pairMatrix';
import {
  Sparkles,
  Heart,
  ChevronRight,
  Flame,
  Award,
  ShieldCheck,
  Briefcase,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface MatchmakerMatrixProps {
  profiles: Person[];
  selectedAnchorPerson: Person | null;
  onSelectAnchorPerson: (person: Person) => void;
  onLaunchArenaMatch: (personA: Person, personB: Person) => void;
  onInspectProfile: (person: Person) => void;
}

export const MatchmakerMatrix: React.FC<MatchmakerMatrixProps> = ({
  profiles,
  selectedAnchorPerson,
  onSelectAnchorPerson,
  onLaunchArenaMatch,
  onInspectProfile,
}) => {
  const [viewMode, setViewMode] = useState<'individual' | 'global_300'>('individual');
  const [rankings, setRankings] = useState<CompatibilityRanking[]>([]);
  const [allPairs, setAllPairs] = useState<PairMatch[]>([]);
  const [pairStats, setPairStats] = useState({ total: 300, completed: 0, pending: 300 });
  const [pairFilter, setPairFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulatingNext, setIsSimulatingNext] = useState(false);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);

  // Set default anchor person if none selected
  useEffect(() => {
    if (!selectedAnchorPerson && profiles.length > 0) {
      onSelectAnchorPerson(profiles[0]);
    }
  }, [profiles, selectedAnchorPerson, onSelectAnchorPerson]);

  // Load rankings for individual anchor
  useEffect(() => {
    if (!selectedAnchorPerson) return;

    const fetchRankings = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/rankings?personId=${selectedAnchorPerson.id}`);
        const data = await res.json();
        if (data.success && data.rankings) {
          setRankings(data.rankings);
        }
      } catch (err) {
        console.error('Failed to load rankings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, [selectedAnchorPerson]);

  // Load 300-pair global matrix
  const loadPairMatrix = async () => {
    try {
      const res = await fetch(`/api/pairs?filter=${pairFilter}&limit=100`);
      const data = await res.json();
      if (data.success) {
        setAllPairs(data.pairs || []);
        setPairStats({
          total: data.totalPairs || 300,
          completed: data.completedCount || 0,
          pending: data.pendingCount || 300,
        });
      }
    } catch (err) {
      console.error('Failed to load pair matrix:', err);
    }
  };

  useEffect(() => {
    if (viewMode === 'global_300') {
      loadPairMatrix();
    }
  }, [viewMode, pairFilter]);

  // Resumable processing: simulate next pending pair with actual LLM
  const handleSimulateNextPair = async () => {
    setIsSimulatingNext(true);
    setBatchNotice(null);
    try {
      const res = await fetch('/api/pairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoNext: true }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      if (data.allCompleted) {
        setBatchNotice('All 300 pairs have already completed simulated dating!');
      } else {
        setBatchNotice(
          `Simulated date complete: ${data.data.personA.name} & ${data.data.personB.name} (${data.data.mutualScore}% mutual - ${data.data.dateVerdict})`
        );
        loadPairMatrix();
      }
    } catch (err) {
      setBatchNotice('Simulation error: ' + (err as Error).message);
    } finally {
      setIsSimulatingNext(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* View Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-white/10 shadow-lg">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('individual')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'individual'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Personalized Rankings (Per Person)
          </button>

          <button
            onClick={() => setViewMode('global_300')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              viewMode === 'global_300'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All 300 Unique Pairs Matrix</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-violet-500/30 font-mono">
              {pairStats.completed}/300
            </span>
          </button>
        </div>

        {viewMode === 'global_300' && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSimulateNextPair}
              disabled={isSimulatingNext}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50"
            >
              {isSimulatingNext ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Simulating Real Date...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Simulate Next Pending Pair (Resumable)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {batchNotice && (
        <div className="p-3.5 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs text-violet-200 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{batchNotice}</span>
        </div>
      )}

      {/* VIEW 1: INDIVIDUAL PERSONALIZED RANKINGS */}
      {viewMode === 'individual' && (
        <>
          {/* Selector Banner */}
          <div className="p-6 rounded-2xl glass-panel border border-white/10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>Personalized Compatibility Matchmaker Matrix</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Select any verified person as the reference anchor to rank all other candidates
                  by real evidence and completed dating results.
                </p>
              </div>

              {/* Person Selector Dropdown */}
              <div className="w-full sm:w-72">
                <select
                  value={selectedAnchorPerson?.id || ''}
                  onChange={e => {
                    const found = profiles.find(p => p.id === e.target.value);
                    if (found) onSelectAnchorPerson(found);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-gray-200 focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.analysis.profession.split('|')[0].trim()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Anchor Summary */}
            {selectedAnchorPerson && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedAnchorPerson.avatar}
                    alt={selectedAnchorPerson.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white/10"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">
                        {selectedAnchorPerson.name}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {selectedAnchorPerson.handle}
                      </span>
                    </div>
                    <p className="text-xs text-cyan-400">
                      {selectedAnchorPerson.analysis.profession}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onInspectProfile(selectedAnchorPerson)}
                  className="text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5"
                >
                  View Full Profile
                </button>
              </div>
            )}
          </div>

          {/* Rankings Leaderboard */}
          <div className="p-6 rounded-2xl glass-panel border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>
                  Ranked Candidates for {selectedAnchorPerson?.name} ({rankings.length} Candidates)
                </span>
              </h3>
              <span className="text-xs text-gray-400 font-mono">
                Actual Dates Priority &bull; Traceable Evidence
              </span>
            </div>

            {isLoading ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-400">Computing compatibility scores across roster...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rankings.map((item, idx) => {
                  const cand = item.targetPerson;
                  const isTop3 = idx < 3;
                  return (
                    <div
                      key={cand.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isTop3
                          ? 'bg-gradient-to-r from-pink-950/20 via-violet-950/20 to-black/40 border-pink-500/30 shadow-md'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Rank Badge */}
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            idx === 0
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                              : idx === 1
                              ? 'bg-gray-300/20 text-gray-200 border border-gray-400/30'
                              : idx === 2
                              ? 'bg-amber-700/20 text-amber-400 border border-amber-700/40'
                              : 'bg-white/5 text-gray-500'
                          }`}
                        >
                          #{idx + 1}
                        </div>

                        <img
                          src={cand.avatar}
                          alt={cand.name}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                        />

                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-white">{cand.name}</h4>
                            <span className="text-[11px] text-gray-400">{cand.handle}</span>
                            {item.hasCompletedDate ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Simulated Date Completed</span>
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Preliminary Evidence
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-300 truncate max-w-sm">
                            {cand.analysis.profession}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[10px] bg-pink-500/10 text-pink-300 px-2 py-0.2 rounded font-mono">
                              {item.sharedInterestsCount} Shared Interest
                              {item.sharedInterestsCount === 1 ? '' : 's'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {item.communicationMatch}
                            </span>
                          </div>
                          {item.highlights?.length > 0 && (
                            <p className="text-[11px] text-gray-400 italic mt-1">
                              &ldquo;{item.highlights[0]}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Highlights & Score Actions */}
                      <div className="flex items-center justify-between md:justify-end space-x-4 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                            {item.hasCompletedDate ? 'Empirical Score' : 'Preliminary Score'}
                          </span>
                          <div className="text-xl font-black text-pink-400">{item.score}%</div>
                        </div>

                        <button
                          onClick={() => {
                            if (selectedAnchorPerson) {
                              onLaunchArenaMatch(selectedAnchorPerson, cand);
                            }
                          }}
                          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-pink-600/20 transition-all shrink-0"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>{item.hasCompletedDate ? 'Re-Run Date' : 'Simulate Date'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* VIEW 2: GLOBAL 300-PAIR MATRIX */}
      {viewMode === 'global_300' && (
        <div className="space-y-6">
          {/* Progress Bar & Filter */}
          <div className="p-6 rounded-2xl glass-panel border border-white/10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-violet-400" />
                  <span>300 Unique Pairs Compatibility Space</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  For 25 verified people, exactly 300 unique pairwise dating combinations exist (25
                  &times; 24 &divide; 2). Preliminary compatibility is calculated for all 300 pairs,
                  with resumable detailed simulation processing.
                </p>
              </div>

              {/* Progress Meter */}
              <div className="text-right">
                <span className="text-xs text-gray-400">Simulation Progress</span>
                <div className="text-xl font-black text-violet-400">
                  {pairStats.completed} / {pairStats.total} Pairs
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-pink-500 to-violet-500 h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(3, (pairStats.completed / pairStats.total) * 100)}%`,
                }}
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-2 pt-2 border-t border-white/5 text-xs">
              <span className="text-gray-400">Filter Pairs:</span>
              <button
                onClick={() => setPairFilter('all')}
                className={`px-3 py-1 rounded-lg ${
                  pairFilter === 'all'
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All 300 Pairs
              </button>
              <button
                onClick={() => setPairFilter('completed')}
                className={`px-3 py-1 rounded-lg ${
                  pairFilter === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Simulated Dates Completed ({pairStats.completed})
              </button>
              <button
                onClick={() => setPairFilter('pending')}
                className={`px-3 py-1 rounded-lg ${
                  pairFilter === 'pending'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Pending Simulation ({pairStats.pending})
              </button>
            </div>
          </div>

          {/* Pairs Table / Cards */}
          <div className="space-y-3">
            {allPairs.map((pair, idx) => (
              <div
                key={pair.pairId}
                className="p-4 rounded-xl glass-panel border border-white/5 hover:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-mono text-gray-500 w-8">#{idx + 1}</span>

                  <div className="flex items-center -space-x-2">
                    <img
                      src={pair.personA.avatar}
                      alt={pair.personA.name}
                      className="w-10 h-10 rounded-xl object-cover border-2 border-[#11131f]"
                    />
                    <img
                      src={pair.personB.avatar}
                      alt={pair.personB.name}
                      className="w-10 h-10 rounded-xl object-cover border-2 border-[#11131f]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">
                        {pair.personA.name} &amp; {pair.personB.name}
                      </span>
                      {pair.hasCompletedDate ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Actual Date Completed</span>
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400">
                          Preliminary Evidence Only
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {pair.hasCompletedDate
                        ? `Date Verdict: "${pair.dateVerdict}"`
                        : `Preliminary Synergy: ${pair.sharedInterests.join(', ')}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-end md:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block uppercase">
                      {pair.hasCompletedDate ? 'Empirical Score' : 'Preliminary Score'}
                    </span>
                    <span className="text-lg font-black text-pink-400">
                      {pair.hasCompletedDate ? pair.actualMutualScore : pair.preliminaryScore}%
                    </span>
                  </div>

                  <button
                    onClick={() => onLaunchArenaMatch(pair.personA, pair.personB)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-all flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>{pair.hasCompletedDate ? 'View / Re-Run' : 'Simulate in Arena'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
