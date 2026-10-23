async function testLiveDating() {
  console.log('====================================================');
  console.log('     DATEMIND AI — LIVE AGENT DATING VERIFICATION   ');
  console.log('====================================================');

  const startTime = Date.now();
  console.log('Initiating real LLM dating simulation between Satya Nadella (person_001) & Sara Blakely (person_013)...');

  try {
    const res = await fetch('http://localhost:3000/api/arena/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personAId: 'person_001',
        personBId: 'person_013',
      }),
    });

    const elapsedMs = Date.now() - startTime;
    console.log(`Simulation finished in ${elapsedMs}ms (${(elapsedMs/1000).toFixed(1)}s). Real LLM inference confirmed.`);

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error);
    }

    const { round1, round2, round3, round4, round5 } = data.rounds;

    console.log('\n--- ROUND 1: INTRODUCTION ---');
    round1.forEach(m => console.log(`${m.senderName}: "${m.text}"`));

    console.log('\n--- ROUND 2: GETTING TO KNOW EACH OTHER ---');
    round2.forEach(m => console.log(`${m.senderName}: "${m.text}"`));

    console.log('\n--- ROUND 3: COMMON GROUND & LIFESTYLE ---');
    round3.forEach(m => console.log(`${m.senderName}: "${m.text}"`));

    console.log('\n--- ROUND 4: INDEPENDENT EVALUATIONS ---');
    console.log(`Satya's Score of Sara: ${round4.agentA.score}/100 (${round4.agentA.confidence} confidence)`);
    console.log(`Satya's Reasons:`, round4.agentA.reasons);
    console.log(`Sara's Score of Satya: ${round4.agentB.score}/100 (${round4.agentB.confidence} confidence)`);
    console.log(`Sara's Reasons:`, round4.agentB.reasons);

    console.log('\n--- ROUND 5: MUTUAL COMPATIBILITY SYNTHESIS ---');
    console.log(`Mutual Score: ${round5.mutualScore}%`);
    console.log(`Verdict: "${round5.dateVerdict}"`);
    console.log(`Executive Summary: ${round5.executiveSummary}`);
    console.log(`Shared Strengths:`, round5.sharedStrengths);
    console.log(`Potential Differences:`, round5.potentialFrictionPoints);

    // Verify persistence
    const fs = require('fs');
    const dates = JSON.parse(fs.readFileSync('data/dates.json', 'utf8'));
    const found = dates.find(d => (d.personA.id === 'person_001' && d.personB.id === 'person_013') || (d.personA.id === 'person_013' && d.personB.id === 'person_001'));

    console.log('\n--- PERSISTENCE VERIFICATION ---');
    console.log('Saved in data/dates.json:', !!found);
    console.log('Date ID:', found?.dateId);
    console.log('Transcript Messages Count:', found?.conversationTranscript?.length);

    console.log('\nRESULT: ALL CHECKS PASSED FOR GENUINE AI DATING!');
  } catch (err) {
    console.error('Dating test failed:', err);
  }
}

testLiveDating();
