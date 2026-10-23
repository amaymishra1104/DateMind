async function testPersonalizedRankings() {
  console.log('====================================================');
  console.log('     DATEMIND AI — PERSONALIZED RANKINGS AUDIT      ');
  console.log('====================================================');

  const testPeople = [
    { id: 'person_004', name: 'Mira Murati' },
    { id: 'person_001', name: 'Satya Nadella' },
    { id: 'person_008', name: 'Brian Chesky' },
  ];

  for (const p of testPeople) {
    console.log(`\n----------------------------------------------------`);
    console.log(`Auditing Rankings for Anchor: ${p.name} (${p.id})`);
    console.log(`----------------------------------------------------`);

    const res = await fetch(`http://localhost:3000/api/rankings?personId=${p.id}`);
    const data = await res.json();

    if (!data.success) {
      console.error(`Failed to load rankings for ${p.name}:`, data.error);
      continue;
    }

    const rankings = data.rankings;
    console.log(`Total Candidates Ranked: ${rankings.length}`);

    // Verification 1: Self-exclusion
    const selfIncluded = rankings.some(r => r.targetPerson.id === p.id);
    console.log(`Self-Exclusion Verified (Does not include self): ${!selfIncluded ? 'PASS' : 'FAIL'}`);

    // Verification 2: Check completed dates influence
    const completedRankings = rankings.filter(r => r.hasCompletedDate);
    console.log(`Candidates with Completed Dates: ${completedRankings.length}`);
    completedRankings.forEach(c => {
      console.log(`  * ${c.targetPerson.name}: Empirical Score ${c.score}% | Date Verdict: "${c.dateVerdict}" | Highlight: "${c.highlights[0]}"`);
    });

    // Verification 3: Inspect Top 3 Matches
    console.log('Top 3 Matches for ' + p.name + ':');
    rankings.slice(0, 3).forEach((r, idx) => {
      console.log(`  #${idx+1}: ${r.targetPerson.name} (${r.targetPerson.analysis.profession.split('|')[0].trim()}) - Score: ${r.score}% | Completed: ${r.hasCompletedDate} | Shared: ${r.sharedInterests.slice(0,2).join(', ')}`);
    });

    // Check explanation grounding
    const topMatch = rankings[0];
    console.log(`Top Match Explanation: "${topMatch.highlights[0]}"`);
  }
}

testPersonalizedRankings();
