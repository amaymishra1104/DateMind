export type SourceType = 'linkedin' | 'instagram';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface EvidenceItem {
  attribute: string;
  source: SourceType;
  supportingInformation: string;
  confidence: ConfidenceLevel;
}

export interface ProfileAnalysis {
  personId: string;
  profession: string;
  interests: string[];
  hobbies: string[];
  lifestyleSignals: string[];
  communicationStyle: string[];
  potentialCompatibilityFactors: string[];
  statedRelationshipPreferences: string[];
  unknowns: string[];
  evidence: EvidenceItem[];
  overallSummary: string;
}

export interface IngestedLinkedInData {
  headline?: string;
  summary?: string;
  experience?: string[];
  education?: string[];
  skills?: string[];
  publicInterests?: string[];
  rawText?: string;
}

export interface IngestedInstagramData {
  bio?: string;
  captionThemes?: string[];
  observableActivities?: string[];
  publicInterests?: string[];
  rawText?: string;
}

export interface Person {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  linkedinUrl: string;
  instagramUrl: string;
  identityVerified: boolean;
  sourceStatus: 'verified' | 'manual_fallback' | 'pending' | 'failed';
  analysisStatus: 'completed' | 'in_progress' | 'pending';
  verificationNotes: string;
  linkedinData: IngestedLinkedInData;
  instagramData: IngestedInstagramData;
  analysis: ProfileAnalysis;
  createdAt: string;
}

export interface DatingMessage {
  id: string;
  round: 1 | 2 | 3;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  referencedEvidence?: string[];
}

export interface AgentEvaluation {
  agentId: string;
  agentName: string;
  targetId: string;
  targetName: string;
  score: number; // 0-100
  confidence: ConfidenceLevel;
  sharedInterests: string[];
  evidenceSupportedSignals: string[];
  potentialLifestyleAlignment: string;
  communicationCompatibility: string;
  potentialDifferences: string[];
  missingInformation: string[];
  reasons: string[];
}

export interface MutualEvaluation {
  dateId: string;
  personA: Person;
  personB: Person;
  agentAEval: AgentEvaluation;
  agentBEval: AgentEvaluation;
  mutualScore: number;
  sharedStrengths: string[];
  potentialFrictionPoints: string[];
  dateVerdict: string;
  executiveSummary: string;
  conversationTranscript: DatingMessage[];
  createdAt: string;
}

export interface CompatibilityRanking {
  targetPerson: Person;
  score: number;
  sharedInterestsCount: number;
  sharedInterests: string[];
  communicationMatch: string;
  lifestyleMatch: string;
  highlights: string[];
  hasCompletedDate?: boolean;
  dateVerdict?: string;
  dateId?: string;
}

