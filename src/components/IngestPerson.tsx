'use client';

import React, { useState } from 'react';
import { Person } from '@/types';
import {
  UserPlus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { LinkedinIcon, InstagramIcon } from './BrandIcons';

interface IngestPersonProps {
  onProfileCreated: (newPerson: Person) => void;
  onSendToArena: (newPerson: Person) => void;
}

export const IngestPerson: React.FC<IngestPersonProps> = ({
  onProfileCreated,
  onSendToArena,
}) => {
  const [name, setName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [avatar, setAvatar] = useState('');
  const [linkedinFallbackText, setLinkedinFallbackText] = useState('');
  const [instagramFallbackText, setInstagramFallbackText] = useState('');
  const [showAssistFallback, setShowAssistFallback] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdPerson, setCreatedPerson] = useState<Person | null>(null);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setCreatedPerson(null);

    if (!name.trim()) {
      setErrorMessage('Please enter the person\'s full name.');
      return;
    }
    if (!linkedinUrl.includes('linkedin.com/in/')) {
      setErrorMessage('Please enter a valid LinkedIn URL (format: https://linkedin.com/in/username).');
      return;
    }
    if (!instagramUrl.includes('instagram.com/')) {
      setErrorMessage('Please enter a valid Instagram URL (format: https://instagram.com/username).');
      return;
    }

    setIsSubmitting(true);
    setCurrentStep(1);

    try {
      // Step 1: URL & Platform Validation
      await new Promise(r => setTimeout(r, 600));
      setCurrentStep(2);

      // Step 2: Source Ingestion & LLM Analysis
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          linkedinUrl: linkedinUrl.trim(),
          instagramUrl: instagramUrl.trim(),
          avatar: avatar.trim() || undefined,
          linkedinFallbackText: linkedinFallbackText.trim() || undefined,
          instagramFallbackText: instagramFallbackText.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.requiresFallback) {
          setShowAssistFallback(true);
          throw new Error(
            `${data.platform.toUpperCase()} restricted direct scraping due to anti-bot / authentication walls. Please provide authorized public bio or headline text below in the assist drawer.`
          );
        }
        throw new Error(data.error || 'Failed to ingest profile.');
      }

      setCurrentStep(3);
      await new Promise(r => setTimeout(r, 500));
      setCurrentStep(4);

      setCreatedPerson(data.data);
      onProfileCreated(data.data);
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillSample = () => {
    setName('Linus Torvalds');
    setLinkedinUrl('https://www.linkedin.com/in/linustorvalds');
    setInstagramUrl('https://www.instagram.com/linustorvalds');
    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');
    setLinkedinFallbackText('Creator of Linux & Git. Linux Foundation Fellow. Passionate about kernel architecture, open source operating systems, and scuba diving.');
    setInstagramFallbackText('Scuba diving, ocean reefs, Finland sauna, coffee, and quiet coding marathons. #OpenSource #ScubaLife');
    setShowAssistFallback(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Overview Card */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 shadow-xl space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              <span>Ingest New Profile (Two Sources Only)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Submit public LinkedIn and Instagram URLs. The profile will be constructed
              strictly from these two sources using Groq LLM analysis.
            </p>
          </div>

          <button
            type="button"
            onClick={handleFillSample}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-all self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Load Verified Example</span>
          </button>
        </div>
      </div>

      {/* Main Ingestion Form */}
      <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-white/10 shadow-2xl">
        <form onSubmit={handleIngest} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Person Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Linus Torvalds"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 text-sm transition-all"
              />
            </div>

            {/* Optional Avatar URL */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                Profile Photo URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://... (photo or avatar URL)"
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 text-sm transition-all"
              />
            </div>

            {/* LinkedIn URL */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center space-x-1.5">
                <LinkedinIcon className="w-4 h-4 text-[#0a66c2]" />
                <span>LinkedIn Profile URL *</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://www.linkedin.com/in/username"
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition-all font-mono text-xs"
              />
              <span className="text-[11px] text-gray-400 block">
                Extracts: Professional headline, experience, skills, and public interests.
              </span>
            </div>

            {/* Instagram URL */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-pink-400 uppercase tracking-wider flex items-center space-x-1.5">
                <InstagramIcon className="w-4 h-4 text-pink-400" />
                <span>Public Instagram URL *</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://www.instagram.com/username"
                value={instagramUrl}
                onChange={e => setInstagramUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 text-sm transition-all font-mono text-xs"
              />
              <span className="text-[11px] text-gray-400 block">
                Extracts: Public biography, visible caption themes, and observable activities.
              </span>
            </div>
          </div>

          {/* Toggle Manual Assist Fallback */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAssistFallback(!showAssistFallback)}
              className="text-xs text-gray-400 hover:text-white flex items-center space-x-1.5 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>
                {showAssistFallback
                  ? 'Hide Authorized Source Fallback Drawer'
                  : 'Platform Anti-Bot Fallback: Provide Authorized Public Text Directly'}
              </span>
            </button>
          </div>

          {/* Manual Assist Fallback Drawer */}
          {showAssistFallback && (
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-4">
              <div className="flex items-start space-x-2 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Platform Compliance Fallback:</strong> If automated scraping of live
                  LinkedIn or Instagram is blocked by authentication or anti-bot challenges, paste
                  the authorized public profile bio, headline, or caption text below. It will be
                  clearly cited as &ldquo;User Verified Public Text&rdquo; in the evidence ledger.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-blue-300 block mb-1">
                    LinkedIn Public Text / Headline (Authorized):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Paste public headline, experience, or skills text..."
                    value={linkedinFallbackText}
                    onChange={e => setLinkedinFallbackText(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-pink-300 block mb-1">
                    Instagram Public Bio / Captions (Authorized):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Paste public bio, observable activities, or hashtags..."
                    value={instagramFallbackText}
                    onChange={e => setInstagramFallbackText(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submission Progress Steps */}
          {isSubmitting && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-pink-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Constructing AI Profile from Two Verified Sources...</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div
                  className={`p-2 rounded border ${
                    currentStep >= 1
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'border-white/5 text-gray-500'
                  }`}
                >
                  1. URL Validation
                </div>
                <div
                  className={`p-2 rounded border ${
                    currentStep >= 2
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'border-white/5 text-gray-500'
                  }`}
                >
                  2. Dual Ingestion
                </div>
                <div
                  className={`p-2 rounded border ${
                    currentStep >= 3
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'border-white/5 text-gray-500'
                  }`}
                >
                  3. Groq LLM Analysis
                </div>
                <div
                  className={`p-2 rounded border ${
                    currentStep >= 4
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'border-white/5 text-gray-500'
                  }`}
                >
                  4. Evidence Indexed
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-pink-600/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Profile with AI...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Sources &amp; Generate AI Agent Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Banner & Created Profile Action */}
      {createdPerson && (
        <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Profile Successfully Constructed for {createdPerson.name}
                </h3>
                <p className="text-xs text-gray-400">
                  {createdPerson.analysis.evidence.length} verified evidence items attributed to
                  LinkedIn &amp; Instagram.
                </p>
              </div>
            </div>

            <button
              onClick={() => onSendToArena(createdPerson)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-lg shadow-pink-600/30 transition-all self-start sm:self-auto"
            >
              <span>Launch into Dating Arena</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
