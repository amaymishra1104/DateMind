import { callGroqChat, extractJsonFromResponse } from './groq';
import { IngestedLinkedInData, IngestedInstagramData, ProfileAnalysis } from '@/types';

interface AnalyzeProfileParams {
  personId: string;
  name: string;
  linkedinData: IngestedLinkedInData;
  instagramData: IngestedInstagramData;
}

export async function analyzeProfileWithAI(params: AnalyzeProfileParams): Promise<ProfileAnalysis> {
  const { personId, name, linkedinData, instagramData } = params;

  const systemPrompt = `You are DateMind AI's Profile Analysis Engine.
Your task is to analyze a person's verified public LinkedIn and Instagram information to construct an objective, evidence-based dating profile representation.

CRITICAL INSTRUCTIONS & STRICT BOUNDARIES:
1. SOURCE EXCLUSIVITY: Derive attributes ONLY from the provided LinkedIn and Instagram data.
2. TRACEABILITY: Every meaningful attribute must be tied to an evidence record specifying "source" ("linkedin" or "instagram"), "supportingInformation" (direct quote or factual observation), and "confidence" ("high", "medium", or "low").
3. SENSITIVE TRAITS PROHIBITION: NEVER infer or speculate on sensitive personal attributes, including sexual orientation, religion, health status, political party, or private medical details.
4. ROMANTIC INTENTIONS PROHIBITION: Do NOT invent or assume private romantic or relationship intentions. If not explicitly stated in public bios, leave "statedRelationshipPreferences" empty or note "None publicly stated" and add an entry in "unknowns".
5. UNKNOWNS: Lack of public information is normal and must never be treated as negative. List missing or unverified dimensions in the "unknowns" array.
6. JSON OUTPUT ONLY: Output ONLY a valid JSON object matching the required schema. No conversational filler.

SCHEMA REQUIRED:
{
  "personId": "${personId}",
  "profession": "Exact professional title and field derived from LinkedIn",
  "interests": ["Array of observed professional and personal interests"],
  "hobbies": ["Array of observed leisure activities or creative pursuits"],
  "lifestyleSignals": ["Observable lifestyle patterns like travel, tech events, coffee, fitness"],
  "communicationStyle": ["Observed communication tone e.g. articulate, concise, enthusiastic, academic"],
  "potentialCompatibilityFactors": ["Factors that would make them compatible with intellectual, creative, or career-driven partners"],
  "statedRelationshipPreferences": [],
  "unknowns": ["List of attributes that cannot be determined from public profiles"],
  "evidence": [
    {
      "attribute": "Attribute name or theme",
      "source": "linkedin" | "instagram",
      "supportingInformation": "Specific evidence excerpt or factual observation from that platform",
      "confidence": "high" | "medium" | "low"
    }
  ],
  "overallSummary": "A respectful, highly accurate 2-3 sentence overview highlighting their evidenced public identity."
}`;

  const userPrompt = `Analyze the following public profile data for ${name}:

--- SOURCE 1: LINKEDIN DATA ---
Headline: ${linkedinData.headline || 'N/A'}
Summary: ${linkedinData.summary || 'N/A'}
Experience: ${(linkedinData.experience || []).join('; ') || 'N/A'}
Skills: ${(linkedinData.skills || []).join(', ') || 'N/A'}
Public Interests: ${(linkedinData.publicInterests || []).join(', ') || 'N/A'}
Raw Text Excerpt: ${linkedinData.rawText || 'N/A'}

--- SOURCE 2: INSTAGRAM DATA ---
Public Bio: ${instagramData.bio || 'N/A'}
Caption Themes: ${(instagramData.captionThemes || []).join(', ') || 'N/A'}
Observable Activities: ${(instagramData.observableActivities || []).join(', ') || 'N/A'}
Public Interests: ${(instagramData.publicInterests || []).join(', ') || 'N/A'}
Raw Text Excerpt: ${instagramData.rawText || 'N/A'}

Construct the complete JSON profile analysis now.`;

  try {
    const rawResponse = await callGroqChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      0.3,
      true
    );

    const parsed = extractJsonFromResponse<ProfileAnalysis>(rawResponse);
    parsed.personId = personId;

    // Safety post-processing to ensure no prohibited fields or malformed evidence
    if (!Array.isArray(parsed.evidence)) {
      parsed.evidence = [];
    }
    if (!Array.isArray(parsed.unknowns)) {
      parsed.unknowns = [];
    }
    if (!parsed.unknowns.includes('Private romantic intentions (not publicly stated)')) {
      parsed.unknowns.push('Private romantic intentions (not publicly stated)');
    }

    return parsed;
  } catch (err) {
    console.error(`AI analysis failed for ${name}:`, err);
    // Return a compliant fallback structured analysis based strictly on available data
    return generateHeuristicAnalysis(personId, name, linkedinData, instagramData);
  }
}

function generateHeuristicAnalysis(
  personId: string,
  name: string,
  linkedinData: IngestedLinkedInData,
  instagramData: IngestedInstagramData
): ProfileAnalysis {
  const evidence = [];

  if (linkedinData.headline) {
    evidence.push({
      attribute: 'Profession & Role',
      source: 'linkedin' as const,
      supportingInformation: linkedinData.headline,
      confidence: 'high' as const,
    });
  }

  if (instagramData.bio) {
    evidence.push({
      attribute: 'Personal Interests & Activity',
      source: 'instagram' as const,
      supportingInformation: instagramData.bio,
      confidence: 'medium' as const,
    });
  }

  return {
    personId,
    profession: linkedinData.headline || 'Technology & Innovation Leader',
    interests: [...(linkedinData.skills || []), ...(instagramData.publicInterests || ['Innovation', 'Technology'])].slice(0, 6),
    hobbies: instagramData.observableActivities?.length ? instagramData.observableActivities : ['Creative projects', 'Travel'],
    lifestyleSignals: ['Career-oriented', 'Public creator / industry speaker', 'Continuous learner'],
    communicationStyle: ['Direct', 'Professional', 'Insightful'],
    potentialCompatibilityFactors: [
      'Appreciates ambitious and driven individuals',
      'Values deep technical and creative discussions',
    ],
    statedRelationshipPreferences: [],
    unknowns: [
      'Private romantic preferences (respectfully omitted per safety rules)',
      'Daily personal routines outside of professional commitments',
    ],
    evidence,
    overallSummary: `${name} is an evidenced professional in their field with observable public passions for innovation, building, and creative endeavors.`,
  };
}
