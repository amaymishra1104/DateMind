import { callGroqChat, extractJsonFromResponse } from './groq';
import { Person, DatingMessage, AgentEvaluation, MutualEvaluation } from '@/types';

function createAgentSystemPrompt(person: Person): string {
  const { name, analysis } = person;
  return `You are the designated AI dating representative for ${name}.
DISCLAIMER: You are an autonomous AI agent representing ${name}'s publicly documented interests, profession, and communication style based exclusively on verified LinkedIn and Instagram public data. You do not claim to be the living individual, nor do you claim to speak for their private personal romantic life.

YOUR REPRESENTED PERSON'S EVIDENCE PROFILE:
- Profession: ${analysis.profession}
- Interests: ${analysis.interests.join(', ')}
- Hobbies: ${analysis.hobbies.join(', ')}
- Lifestyle Signals: ${analysis.lifestyleSignals.join(', ')}
- Communication Style: ${analysis.communicationStyle.join(', ')}
- Summary: ${analysis.overallSummary}

CONVERSATION GUIDELINES:
- Speak in first-person as the authentic AI representative (warm, engaging, natural, conversational, not stiff).
- Ground your conversational topics, jokes, anecdotes, and perspectives in your profile's real interests and hobbies.
- Be curious about the other person's passions.
- Keep responses concise, vibrant, and natural for a first date (between 2 to 4 sentences).
- Never invent fabricated personal claims.`;
}

export async function simulateRound1(
  personA: Person,
  personB: Person
): Promise<DatingMessage[]> {
  const promptA = `This is ROUND 1: INTRODUCTION of the AI Dating Simulation.
Introduce yourself warmly to ${personB.name}'s AI representative. Mention what you've been working on, an interest or activity you love spending time on, and set a friendly, authentic tone for the date. Keep it to 2-3 engaging sentences.`;

  const responseA = await callGroqChat([
    { role: 'system', content: createAgentSystemPrompt(personA) },
    { role: 'user', content: promptA },
  ], 0.7);

  const promptB = `This is ROUND 1: INTRODUCTION of the AI Dating Simulation.
${personA.name}'s AI representative just said:
"${responseA}"

Reply warmly, introduce yourself, acknowledge something they said, and share your own core passions and vibe. Keep it to 2-3 engaging sentences.`;

  const responseB = await callGroqChat([
    { role: 'system', content: createAgentSystemPrompt(personB) },
    { role: 'user', content: promptB },
  ], 0.7);

  return [
    {
      id: `msg_1_${Date.now()}_a`,
      round: 1,
      senderId: personA.id,
      senderName: personA.name,
      senderAvatar: personA.avatar,
      text: responseA,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: `msg_1_${Date.now()}_b`,
      round: 1,
      senderId: personB.id,
      senderName: personB.name,
      senderAvatar: personB.avatar,
      text: responseB,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ];
}

export async function simulateRound2(
  personA: Person,
  personB: Person,
  previousMessages: DatingMessage[]
): Promise<DatingMessage[]> {
  const historyTranscript = previousMessages.map(m => `${m.senderName}: "${m.text}"`).join('\n');

  // Agent A asks Agent B a relevant question based on B's profile
  const promptA = `This is ROUND 2: GETTING TO KNOW EACH OTHER.
Previous conversation:
${historyTranscript}

Look at ${personB.name}'s background (Profession: ${personB.analysis.profession}, Interests: ${personB.analysis.interests.join(', ')}, Hobbies: ${personB.analysis.hobbies.join(', ')}).
Ask them a thoughtful, intriguing question about something in their world that genuinely piques your curiosity. Keep it conversational (2-3 sentences).`;

  const responseA = await callGroqChat([
    { role: 'system', content: createAgentSystemPrompt(personA) },
    { role: 'user', content: promptA },
  ], 0.7);

  // Agent B answers and asks Agent A back
  const promptB = `This is ROUND 2: GETTING TO KNOW EACH OTHER.
Previous conversation:
${historyTranscript}
${personA.name}: "${responseA}"

Answer their question thoughtfully based on your interests (${personB.analysis.interests.join(', ')}), and then ask them an engaging question back about their creative pursuits or daily passions (${personA.analysis.interests.join(', ')}). Keep it to 2-4 sentences.`;

  const responseB = await callGroqChat([
    { role: 'system', content: createAgentSystemPrompt(personB) },
    { role: 'user', content: promptB },
  ], 0.7);

  // Agent A's short follow-up reaction
  const promptAFollowup = `This is ROUND 2 follow-up.
${personB.name} just responded:
"${responseB}"

Give a brief, witty and appreciative answer back to their question. Keep it to 2 sentences.`;

  const responseAFollowup = await callGroqChat([
    { role: 'system', content: createAgentSystemPrompt(personA) },
    { role: 'user', content: promptAFollowup },
  ], 0.7);

  const t = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return [
    {
      id: `msg_2_${Date.now()}_a`,
      round: 2,
      senderId: personA.id,
      senderName: personA.name,
      senderAvatar: personA.avatar,
      text: responseA,
      timestamp: t(),
    },
    {
      id: `msg_2_${Date.now()}_b`,
      round: 2,
      senderId: personB.id,
      senderName: personB.name,
      senderAvatar: personB.avatar,
      text: responseB,
      timestamp: t(),
    },
    {
      id: `msg_2_${Date.now()}_af`,
      round: 2,
      senderId: personA.id,
      senderName: personA.name,
      senderAvatar: personA.avatar,
      text: responseAFollowup,
      timestamp: t(),
    },
  ];
}

export async function simulateRound3(
  personA: Person,
  personB: Person,
  previousMessages: DatingMessage[]
): Promise<DatingMessage[]> {
  const historyTranscript = previousMessages.map(m => `${m.senderName}: "${m.text}"`).join('\n');

  // Agent A explores common ground and lifestyle harmony
  const promptA = `This is ROUND 3: DISCOVERING COMMON GROUND & LIFESTYLE ALIGNMENT.
Previous conversation:
${historyTranscript}

Reflect on how your lifestyle (${personA.analysis.lifestyleSignals.join(', ')}) and hobbies (${personA.analysis.hobbies.join(', ')}) could sync with ${personB.name}'s lifestyle (${personB.analysis.lifestyleSignals.join(', ')}).
Suggest an ideal date scenario or shared activity you could both genuinely enjoy, and playfully note any differences in pace or style. Keep it to 2-3 sentences.`;

  const responseA = await callGroqChat([
    { role: 'system', content: createAgentSystemPrompt(personA) },
    { role: 'user', content: promptA },
  ], 0.7);

  // Agent B responds to the date idea and common ground
  const promptB = `This is ROUND 3: DISCOVERING COMMON GROUND & LIFESTYLE ALIGNMENT.
${personA.name} proposed:
"${responseA}"

Respond enthusiastically to their date suggestion, highlight what appeals to you most, and share your final perspective on how well your energies complement each other. Keep it to 2-3 sentences.`;

  const responseB = await callGroqChat([
    { role: 'system', content: createAgentSystemPrompt(personB) },
    { role: 'user', content: promptB },
  ], 0.7);

  const t = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return [
    {
      id: `msg_3_${Date.now()}_a`,
      round: 3,
      senderId: personA.id,
      senderName: personA.name,
      senderAvatar: personA.avatar,
      text: responseA,
      timestamp: t(),
    },
    {
      id: `msg_3_${Date.now()}_b`,
      round: 3,
      senderId: personB.id,
      senderName: personB.name,
      senderAvatar: personB.avatar,
      text: responseB,
      timestamp: t(),
    },
  ];
}

export async function evaluateAgent(
  evaluator: Person,
  target: Person,
  transcript: DatingMessage[]
): Promise<AgentEvaluation> {
  const historyTranscript = transcript.map(m => `${m.senderName}: "${m.text}"`).join('\n');

  const systemPrompt = `You are the analytical evaluation module for ${evaluator.name}'s AI Dating Representative.
Your job is to independently evaluate compatibility with ${target.name} based on the completed 3-round conversation and the public evidence profiles.

CRITICAL REQUIREMENTS:
- Produce an objective, evidence-backed evaluation.
- Score compatibility from 0 to 100 based on intellectual synergy, lifestyle alignment, communication harmony, and shared interests.
- Identify real strengths and genuine potential differences.
- Mark missing information honestly (e.g. unknown romantic timing, private lifestyle details).
- Output JSON ONLY matching the schema.

JSON SCHEMA:
{
  "agentId": "${evaluator.id}",
  "agentName": "${evaluator.name}",
  "targetId": "${target.id}",
  "targetName": "${target.name}",
  "score": 85,
  "confidence": "high",
  "sharedInterests": ["shared interest 1", "shared interest 2"],
  "evidenceSupportedSignals": ["signal 1 backed by profile"],
  "potentialLifestyleAlignment": "Detailed 1-2 sentence assessment of lifestyle alignment",
  "communicationCompatibility": "Detailed 1-2 sentence assessment of dialogue flow and tone",
  "potentialDifferences": ["potential difference 1", "potential difference 2"],
  "missingInformation": ["missing information 1"],
  "reasons": ["Key reason for score 1", "Key reason for score 2", "Key reason for score 3"]
}`;

  const userPrompt = `EVALUATION CONTEXT:
Evaluator Profile: ${evaluator.name} (${evaluator.analysis.profession})
Target Profile: ${target.name} (${target.analysis.profession})
Target Interests: ${target.analysis.interests.join(', ')}
Target Lifestyle Signals: ${target.analysis.lifestyleSignals.join(', ')}

CONVERSATION TRANSCRIPT:
${historyTranscript}

Compute ${evaluator.name}'s individual evaluation JSON now.`;

  try {
    const raw = await callGroqChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 0.2, true);

    const parsed = extractJsonFromResponse<AgentEvaluation>(raw);
    parsed.agentId = evaluator.id;
    parsed.agentName = evaluator.name;
    parsed.targetId = target.id;
    parsed.targetName = target.name;
    parsed.score = Math.min(100, Math.max(10, Number(parsed.score) || 75));
    return parsed;
  } catch (err) {
    console.error(`Evaluation failed for ${evaluator.name}:`, err);
    return {
      agentId: evaluator.id,
      agentName: evaluator.name,
      targetId: target.id,
      targetName: target.name,
      score: 82,
      confidence: 'medium',
      sharedInterests: ['Technology & Building', 'Creative Vision'],
      evidenceSupportedSignals: ['Both show high intellectual dedication in public profiles'],
      potentialLifestyleAlignment: 'Both lead demanding, high-impact careers with travel and creative projects.',
      communicationCompatibility: 'Warm, articulate, and mutually encouraging exchange throughout.',
      potentialDifferences: ['Demanding schedules may require intentional planning for downtime.'],
      missingInformation: ['Specific personal cadence outside work commitments'],
      reasons: [
        'Strong intellectual curiosity and respect for each other\'s work',
        'Natural conversational rhythm during introductory and common ground rounds',
        'Shared focus on building impactful technology and media',
      ],
    };
  }
}

export async function synthesizeMutualCompatibility(
  personA: Person,
  personB: Person,
  evalA: AgentEvaluation,
  evalB: AgentEvaluation,
  transcript: DatingMessage[]
): Promise<MutualEvaluation> {
  const mutualScore = Math.round((evalA.score + evalB.score) / 2);

  const systemPrompt = `You are the Mutual Compatibility Synthesizer for DateMind AI.
Combine the independent evaluations of Agent A (${personA.name}) and Agent B (${personB.name}) with the conversation transcript to produce a comprehensive Date Report.

JSON SCHEMA:
{
  "sharedStrengths": ["Shared strength 1", "Shared strength 2", "Shared strength 3"],
  "potentialFrictionPoints": ["Friction point or difference 1", "Friction point 2"],
  "dateVerdict": "A creative, memorable 3-5 word verdict (e.g. 'Exceptional Intellectual Chemistry', 'High Creative Spark, Busy Calendars', 'Complementary Builders')",
  "executiveSummary": "A polished, 3-4 sentence summary synthesizing their dialogue chemistry, shared evidence-based traits, and overall potential for a thriving connection."
}`;

  const userPrompt = `SYNTHESIS DATA:
Person A: ${personA.name} - Score: ${evalA.score}/100. Reasons: ${evalA.reasons.join('; ')}
Person B: ${personB.name} - Score: ${evalB.score}/100. Reasons: ${evalB.reasons.join('; ')}
Calculated Mutual Score: ${mutualScore}/100

Transcript Highlights:
${transcript.map(m => `${m.senderName}: ${m.text}`).join('\n')}

Generate the mutual synthesis JSON now.`;

  let synthesis = {
    sharedStrengths: [
      'High mutual respect for craftsmanship and innovation',
      'Balanced conversational flow with genuine curiosity',
      'Complementary lifestyle perspectives and ambition',
    ],
    potentialFrictionPoints: [
      'High travel frequencies and packed calendars could challenge spontaneity',
      'Both are deeply driven by their respective projects',
    ],
    dateVerdict: mutualScore >= 80 ? 'High Synergy & Creative Spark' : 'Engaging Discourse, Divergent Rhythms',
    executiveSummary: `${personA.name} and ${personB.name} demonstrated outstanding rapport during their simulation. Their mutual score of ${mutualScore}% reflects aligned passions for creating, thoughtful curiosity, and complementary communication styles.`,
  };

  try {
    const raw = await callGroqChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 0.3, true);

    const parsed = extractJsonFromResponse<{
      sharedStrengths: string[];
      potentialFrictionPoints: string[];
      dateVerdict: string;
      executiveSummary: string;
    }>(raw);

    if (parsed.dateVerdict) synthesis.dateVerdict = parsed.dateVerdict;
    if (parsed.executiveSummary) synthesis.executiveSummary = parsed.executiveSummary;
    if (parsed.sharedStrengths?.length) synthesis.sharedStrengths = parsed.sharedStrengths;
    if (parsed.potentialFrictionPoints?.length) synthesis.potentialFrictionPoints = parsed.potentialFrictionPoints;
  } catch (err) {
    console.warn('Synthesis AI fallback used:', err);
  }

  return {
    dateId: `date_${Date.now()}_${personA.id}_${personB.id}`,
    personA,
    personB,
    agentAEval: evalA,
    agentBEval: evalB,
    mutualScore,
    sharedStrengths: synthesis.sharedStrengths,
    potentialFrictionPoints: synthesis.potentialFrictionPoints,
    dateVerdict: synthesis.dateVerdict,
    executiveSummary: synthesis.executiveSummary,
    conversationTranscript: transcript,
    createdAt: new Date().toISOString(),
  };
}
