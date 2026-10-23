'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Person, DatingMessage, AgentEvaluation, MutualEvaluation } from '@/types';
import confetti from 'canvas-confetti';
import {
  HeartHandshake,
  Sparkles,
  Play,
  RotateCcw,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shuffle,
  ChevronRight,
  Flame,
  Award,
  Zap,
} from 'lucide-react';

interface DatingArenaProps {
  profiles: Person[];
  selectedAgentA: Person | null;
  selectedAgentB: Person | null;
  setSelectedAgentA: (person: Person) => void;
  setSelectedAgentB: (person: Person) => void;
  onInspectProfile: (person: Person) => void;
}

export const DatingArena: React.FC<DatingArenaProps> = ({
  profiles,
  selectedAgentA,
  selectedAgentB,
  setSelectedAgentA,
  setSelectedAgentB,
  onInspectProfile,
}) => {
  const [currentRound, setCurrentRound] = useState<number>(0); // 0 = idle, 1..5 = rounds
  const [messages, setMessages] = useState<DatingMessage[]>([]);
  const [evalA, setEvalA] = useState<AgentEvaluation | null>(null);
  const [evalB, setEvalB] = useState<AgentEvaluation | null>(null);
  const [mutualReport, setMutualReport] = useState<MutualEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'fast'>('normal');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeSpeakerId]);

  // Trigger confetti on round 5
  useEffect(() => {
    if (currentRound === 5 && mutualReport) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981'],
      });
    }
  }, [currentRound, mutualReport]);

  const handlePickRandomPair = () => {
    if (profiles.length < 2) return;
    const idxA = Math.floor(Math.random() * profiles.length);
    let idxB = Math.floor(Math.random() * profiles.length);
    while (idxB === idxA) {
      idxB = Math.floor(Math.random() * profiles.length);
    }
    setSelectedAgentA(profiles[idxA]);
    setSelectedAgentB(profiles[idxB]);
    handleReset();
  };

  const handleReset = () => {
    setCurrentRound(0);
    setMessages([]);
    setEvalA(null);
    setEvalB(null);
    setMutualReport(null);
    setIsLoading(false);
    setActiveSpeakerId(null);
  };

  const startSimulation = async () => {
    if (!selectedAgentA || !selectedAgentB) return;
    if (selectedAgentA.id === selectedAgentB.id) {
      alert('Please select two distinct people for the dating simulation.');
      return;
    }

    handleReset();
    setIsLoading(true);
    setCurrentRound(1);

    try {
      // Call full simulation API
      const res = await fetch('/api/arena/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personAId: selectedAgentA.id,
          personBId: selectedAgentB.id,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to simulate date');
      }

      const { rounds } = data;
      const delay = playbackSpeed === 'fast' ? 700 : 1800;

      // Play Round 1 messages
      for (const msg of rounds.round1) {
        setActiveSpeakerId(msg.senderId);
        await new Promise(r => setTimeout(r, delay / 2));
        setMessages(prev => [...prev, msg]);
        await new Promise(r => setTimeout(r, delay));
      }

      // Transition to Round 2
      setCurrentRound(2);
      for (const msg of rounds.round2) {
        setActiveSpeakerId(msg.senderId);
        await new Promise(r => setTimeout(r, delay / 2));
        setMessages(prev => [...prev, msg]);
        await new Promise(r => setTimeout(r, delay));
      }

      // Transition to Round 3
      setCurrentRound(3);
      for (const msg of rounds.round3) {
        setActiveSpeakerId(msg.senderId);
        await new Promise(r => setTimeout(r, delay / 2));
        setMessages(prev => [...prev, msg]);
        await new Promise(r => setTimeout(r, delay));
      }

      setActiveSpeakerId(null);

      // Transition to Round 4 (Individual Evaluations)
      setCurrentRound(4);
      setEvalA(rounds.round4.agentA);
      setEvalB(rounds.round4.agentB);
      await new Promise(r => setTimeout(r, delay * 1.5));

      // Transition to Round 5 (Mutual Compatibility Report)
      setCurrentRound(5);
      setMutualReport(rounds.round5);
    } catch (err) {
      console.error('Arena simulation failed:', err);
      alert('Simulation error: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
      setActiveSpeakerId(null);
    }
  };

  const exportDateReport = () => {
    if (!mutualReport || !selectedAgentA || !selectedAgentB) return;

    const reportText = `# DATEMIND AI — AGENT DATING SIMULATION REPORT
Date ID: ${mutualReport.dateId}
Simulated: ${new Date(mutualReport.createdAt).toLocaleString()}

## PARTICIPANTS
Agent A: ${selectedAgentA.name} (${selectedAgentA.analysis.profession})
- LinkedIn: ${selectedAgentA.linkedinUrl}
- Instagram: ${selectedAgentA.instagramUrl}

Agent B: ${selectedAgentB.name} (${selectedAgentB.analysis.profession})
- LinkedIn: ${selectedAgentB.linkedinUrl}
- Instagram: ${selectedAgentB.instagramUrl}

---

## FINAL MUTUAL COMPATIBILITY SCORE: ${mutualReport.mutualScore}/100
VERDICT: ${mutualReport.dateVerdict}

### Executive Summary:
${mutualReport.executiveSummary}

### Shared Strengths:
${mutualReport.sharedStrengths.map(s => `- ${s}`).join('\n')}

### Potential Friction Points:
${mutualReport.potentialFrictionPoints.map(f => `- ${f}`).join('\n')}

---

## ROUND 4 INDIVIDUAL EVALUATIONS

### ${selectedAgentA.name}'s Evaluation of ${selectedAgentB.name}:
- Score: ${evalA?.score}/100 (${evalA?.confidence} confidence)
- Shared Interests: ${evalA?.sharedInterests.join(', ')}
- Lifestyle Alignment: ${evalA?.potentialLifestyleAlignment}
- Communication Harmony: ${evalA?.communicationCompatibility}
- Reasons:
${(evalA?.reasons || []).map(r => `  * ${r}`).join('\n')}

### ${selectedAgentB.name}'s Evaluation of ${selectedAgentA.name}:
- Score: ${evalB?.score}/100 (${evalB?.confidence} confidence)
- Shared Interests: ${evalB?.sharedInterests.join(', ')}
- Lifestyle Alignment: ${evalB?.potentialLifestyleAlignment}
- Communication Harmony: ${evalB?.communicationCompatibility}
- Reasons:
${(evalB?.reasons || []).map(r => `  * ${r}`).join('\n')}

---

## CONVERSATION TRANSCRIPT
${messages
  .map(
    m => `[Round ${m.round}] ${m.senderName} (${m.timestamp}):
"${m.text}"
`
  )
  .join('\n')}

---
DISCLAIMER: This conversation was generated by autonomous AI agents representing each person's publicly documented LinkedIn and Instagram profiles. It is an algorithmic simulation for compatibility evaluation and does not represent direct personal participation by the living individuals.`;

    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datemind_report_${selectedAgentA.name.replace(/\s+/g, '_')}_${selectedAgentB.name.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Simulation Disclaimer Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-violet-950/30 border border-violet-500/20 text-xs text-violet-200">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
          <span>
            <strong>AI Agent Simulation:</strong> Agents represent verified public LinkedIn &amp;
            Instagram evidence. Neither individual personally authored these messages.
          </span>
        </div>
        <span className="hidden sm:inline font-mono text-[11px] bg-violet-500/20 px-2 py-0.5 rounded text-violet-300">
          Powered by Groq LLM
        </span>
      </div>

      {/* Date Setup / Match Selectors */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Agent A Card Selector */}
          <div className="w-full lg:w-5/12 p-4 rounded-xl bg-white/[0.03] border border-pink-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-pink-400 tracking-wider uppercase flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>Agent A (Representative)</span>
              </span>
              {selectedAgentA && (
                <button
                  onClick={() => onInspectProfile(selectedAgentA)}
                  className="text-[11px] text-pink-300 hover:underline"
                >
                  Inspect Profile
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {selectedAgentA ? (
                <>
                  <div
                    className={`relative rounded-xl p-0.5 transition-all ${
                      activeSpeakerId === selectedAgentA.id
                        ? 'ring-4 ring-pink-500 shadow-lg shadow-pink-500/50 scale-105'
                        : ''
                    }`}
                  >
                    <img
                      src={selectedAgentA.avatar}
                      alt={selectedAgentA.name}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-white truncate">
                      {selectedAgentA.name}
                    </h4>
                    <p className="text-xs text-gray-400 truncate">
                      {selectedAgentA.analysis.profession}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="text-[10px] bg-pink-500/20 text-pink-300 px-1.5 py-0.2 rounded font-mono">
                        {selectedAgentA.analysis.interests[0] || 'Innovation'}
                      </span>
                      <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.2 rounded font-mono">
                        {selectedAgentA.analysis.hobbies[0] || 'Creative'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-400">Select person for Agent A</div>
              )}
            </div>

            {/* Select Dropdown */}
            <select
              value={selectedAgentA?.id || ''}
              onChange={e => {
                const found = profiles.find(p => p.id === e.target.value);
                if (found) {
                  setSelectedAgentA(found);
                  handleReset();
                }
              }}
              disabled={isLoading}
              className="mt-3 w-full px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-gray-200 focus:outline-none focus:border-pink-500"
            >
              <option value="" disabled>
                Select from {profiles.length} Verified People...
              </option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.analysis.profession.split('|')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Central Match VS Badge & Randomize */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-pink-500/30">
              VS
            </div>
            <button
              onClick={handlePickRandomPair}
              disabled={isLoading}
              className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Random Match</span>
            </button>
          </div>

          {/* Agent B Card Selector */}
          <div className="w-full lg:w-5/12 p-4 rounded-xl bg-white/[0.03] border border-violet-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-violet-400 tracking-wider uppercase flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Agent B (Representative)</span>
              </span>
              {selectedAgentB && (
                <button
                  onClick={() => onInspectProfile(selectedAgentB)}
                  className="text-[11px] text-violet-300 hover:underline"
                >
                  Inspect Profile
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {selectedAgentB ? (
                <>
                  <div
                    className={`relative rounded-xl p-0.5 transition-all ${
                      activeSpeakerId === selectedAgentB.id
                        ? 'ring-4 ring-violet-500 shadow-lg shadow-violet-500/50 scale-105'
                        : ''
                    }`}
                  >
                    <img
                      src={selectedAgentB.avatar}
                      alt={selectedAgentB.name}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-white truncate">
                      {selectedAgentB.name}
                    </h4>
                    <p className="text-xs text-gray-400 truncate">
                      {selectedAgentB.analysis.profession}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.2 rounded font-mono">
                        {selectedAgentB.analysis.interests[0] || 'Innovation'}
                      </span>
                      <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.2 rounded font-mono">
                        {selectedAgentB.analysis.hobbies[0] || 'Creative'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-400">Select person for Agent B</div>
              )}
            </div>

            {/* Select Dropdown */}
            <select
              value={selectedAgentB?.id || ''}
              onChange={e => {
                const found = profiles.find(p => p.id === e.target.value);
                if (found) {
                  setSelectedAgentB(found);
                  handleReset();
                }
              }}
              disabled={isLoading}
              className="mt-3 w-full px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-gray-200 focus:outline-none focus:border-violet-500"
            >
              <option value="" disabled>
                Select from {profiles.length} Verified People...
              </option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.analysis.profession.split('|')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span>Speed:</span>
            <button
              onClick={() => setPlaybackSpeed('normal')}
              className={`px-2 py-1 rounded text-[11px] font-medium ${
                playbackSpeed === 'normal'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Normal (Realistic)
            </button>
            <button
              onClick={() => setPlaybackSpeed('fast')}
              className={`px-2 py-1 rounded text-[11px] font-medium ${
                playbackSpeed === 'fast'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Fast-Forward
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {messages.length > 0 && (
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={startSimulation}
              disabled={isLoading || !selectedAgentA || !selectedAgentB}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-pink-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Agents Dating in Real-Time...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Initiate Agent Date Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Round Stepper Indicator */}
      <div className="p-4 rounded-xl glass-panel border border-white/5">
        <div className="grid grid-cols-5 gap-2 sm:gap-4 text-center">
          {[
            { num: 1, name: 'Round 1', desc: 'Introduction' },
            { num: 2, name: 'Round 2', desc: 'Get to Know' },
            { num: 3, name: 'Round 3', desc: 'Common Ground' },
            { num: 4, name: 'Round 4', desc: 'Agent Evals' },
            { num: 5, name: 'Round 5', desc: 'Mutual Score' },
          ].map(r => {
            const isActive = currentRound === r.num;
            const isCompleted = currentRound > r.num;
            return (
              <div
                key={r.num}
                className={`p-2.5 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-pink-500/20 border-pink-500/50 shadow-md shadow-pink-500/20 scale-[1.02]'
                    : isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-white/[0.02] border-white/5 text-gray-500'
                }`}
              >
                <div className="flex items-center justify-center space-x-1.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isActive ? (
                    <div className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                  ) : null}
                  <span
                    className={`text-xs font-bold ${
                      isActive ? 'text-pink-300' : isCompleted ? 'text-emerald-300' : 'text-gray-400'
                    }`}
                  >
                    {r.name}
                  </span>
                </div>
                <p className="text-[10px] hidden sm:block truncate mt-0.5 text-gray-400">
                  {r.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 shadow-2xl min-h-[420px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <HeartHandshake className="w-5 h-5 text-pink-400" />
              <h3 className="text-base font-semibold text-white">Live Date Dialogue Stream</h3>
            </div>
            {currentRound > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                <span>
                  {currentRound <= 3
                    ? `Conversation Round ${currentRound} of 3`
                    : currentRound === 4
                    ? 'Calculating Individual Evaluations'
                    : 'Mutual Date Synthesis Complete'}
                </span>
              </span>
            )}
          </div>

          {messages.length === 0 && currentRound === 0 && (
            <div className="py-20 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto text-gray-400 border border-white/10">
                <HeartHandshake className="w-7 h-7 text-pink-400/80" />
              </div>
              <h4 className="text-base font-semibold text-gray-200">The Arena is Ready</h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Select two verified individuals above and click &ldquo;Initiate Agent Date
                Simulation&rdquo; to watch real LLM agents converse across 5 structured rounds.
              </p>
            </div>
          )}

          {/* Messages Feed */}
          <div className="space-y-4">
            {messages.map((msg, idx) => {
              const isAgentA = msg.senderId === selectedAgentA?.id;
              return (
                <div
                  key={msg.id || idx}
                  className={`flex items-start space-x-3 ${
                    isAgentA ? 'flex-row' : 'flex-row-reverse space-x-reverse'
                  }`}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                  <div className={`max-w-xl space-y-1 ${isAgentA ? 'items-start' : 'items-end'}`}>
                    <div
                      className={`flex items-center space-x-2 ${
                        isAgentA ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <span className="text-xs font-semibold text-white">{msg.senderName}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        Round {msg.round} • {msg.timestamp}
                      </span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                        isAgentA
                          ? 'bg-gradient-to-br from-pink-950/40 to-pink-900/20 border border-pink-500/30 text-pink-100 rounded-tl-sm'
                          : 'bg-gradient-to-br from-violet-950/40 to-violet-900/20 border border-violet-500/30 text-violet-100 rounded-tr-sm'
                      }`}
                    >
                      {msg.text}
                    </div>

                    <div
                      className={`flex items-center space-x-1.5 text-[10px] text-gray-400 ${
                        isAgentA ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <span className="bg-white/5 px-2 py-0.5 rounded text-[10px]">
                        AI agent persona grounded in public evidence
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Active typing indicator */}
            {isLoading && activeSpeakerId && (
              <div className="flex items-center space-x-2 text-xs text-pink-400 py-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce delay-200" />
                </div>
                <span>
                  {activeSpeakerId === selectedAgentA?.id ? selectedAgentA?.name : selectedAgentB?.name}{' '}
                  is formulating response based on profile evidence...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Round 4: Side-by-Side Agent Independent Evaluations */}
        {currentRound >= 4 && evalA && evalB && (
          <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Round 4: Independent Agent Compatibility Evaluations
              </h3>
            </div>
            <p className="text-xs text-gray-400">
              Each AI agent independently evaluates compatibility with its counterpart based on the
              multi-round conversation and structured profile evidence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Agent A's Eval */}
              <div className="p-4 rounded-xl bg-pink-950/20 border border-pink-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-pink-300">
                    {evalA.agentName}&apos;s Evaluation of {evalA.targetName}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-black text-pink-400">{evalA.score}</span>
                    <span className="text-xs text-gray-400">/ 100</span>
                  </div>
                </div>

                <div className="text-xs space-y-2 text-gray-300">
                  <div>
                    <span className="text-gray-400 font-medium">Lifestyle Alignment: </span>
                    <span>{evalA.potentialLifestyleAlignment}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Communication Harmony: </span>
                    <span>{evalA.communicationCompatibility}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Key Reasons: </span>
                    <ul className="list-disc list-inside mt-1 text-gray-300 space-y-0.5">
                      {evalA.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Agent B's Eval */}
              <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-violet-300">
                    {evalB.agentName}&apos;s Evaluation of {evalB.targetName}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-black text-violet-400">{evalB.score}</span>
                    <span className="text-xs text-gray-400">/ 100</span>
                  </div>
                </div>

                <div className="text-xs space-y-2 text-gray-300">
                  <div>
                    <span className="text-gray-400 font-medium">Lifestyle Alignment: </span>
                    <span>{evalB.potentialLifestyleAlignment}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Communication Harmony: </span>
                    <span>{evalB.communicationCompatibility}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Key Reasons: </span>
                    <ul className="list-disc list-inside mt-1 text-gray-300 space-y-0.5">
                      {evalB.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Round 5: Mutual Compatibility Synthesis Report */}
        {currentRound === 5 && mutualReport && (
          <div className="mt-8 pt-6 border-t border-white/10 space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-950/40 via-violet-950/40 to-black/60 border border-pink-500/40 shadow-2xl space-y-6">
              {/* Header with Mutual Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-pink-400" />
                    <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                      Round 5: Final Compatibility Synthesis
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {mutualReport.dateVerdict}
                  </h3>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Mutual Score</span>
                    <div className="text-3xl font-black text-pink-400">
                      {mutualReport.mutualScore}%
                    </div>
                  </div>
                  <button
                    onClick={exportDateReport}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-all shadow-md"
                  >
                    <Download className="w-4 h-4 text-pink-400" />
                    <span>Export Date Report</span>
                  </button>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1">
                  Executive Compatibility Summary:
                </span>
                <p className="text-sm text-gray-200 leading-relaxed">
                  {mutualReport.executiveSummary}
                </p>
              </div>

              {/* Shared Strengths & Friction Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Shared Strengths &amp; Alignment</span>
                  </span>
                  <ul className="text-xs text-gray-300 space-y-1.5">
                    {mutualReport.sharedStrengths.map((str, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20">
                  <span className="text-xs font-semibold text-amber-400 flex items-center space-x-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Potential Differences &amp; Caveats</span>
                  </span>
                  <ul className="text-xs text-gray-300 space-y-1.5">
                    {mutualReport.potentialFrictionPoints.map((fric, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{fric}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
