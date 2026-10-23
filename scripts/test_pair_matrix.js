const fs = require('fs');

async function testPairMatrix() {
  console.log('====================================================');
  console.log('       DATEMIND AI — 300-PAIR MATRIX AUDIT          ');
  console.log('====================================================');

  const profiles = JSON.parse(fs.readFileSync('data/profiles.json', 'utf8'));
  const N = profiles.length;
  const expectedUniquePairs = (N * (N - 1)) / 2;

  console.log(`Base Roster Count (N): ${N}`);
  console.log(`Expected Unique Unordered Pairs: N*(N-1)/2 = ${expectedUniquePairs}`);

  const res = await fetch('http://localhost:3000/api/pairs?limit=400');
  const data = await res.json();

  console.log('\n--- API /api/pairs Audit ---');
  console.log('Total Pairs Reported by API:', data.totalPairs);
  console.log('Completed Dates Count:', data.completedCount);
  console.log('Pending Dates Count:', data.pendingCount);
  console.log('Sum check (completed + pending === total):', data.completedCount + data.pendingCount === data.totalPairs);

  // Check uniqueness of pairId keys
  const pairIds = new Set();
  let duplicateCount = 0;
  let selfPairCount = 0;
  let validScoreCount = 0;

  data.pairs.forEach(p => {
    if (pairIds.has(p.pairId)) duplicateCount++;
    pairIds.add(p.pairId);

    if (p.personA.id === p.personB.id) selfPairCount++;

    const score = p.hasCompletedDate ? p.actualMutualScore : p.preliminaryScore;
    if (score >= 40 && score <= 100) validScoreCount++;
  });

  console.log('\n--- Uniqueness & Integrity Checks ---');
  console.log('Unique Pair IDs:', pairIds.size);
  console.log('Duplicate Pairs:', duplicateCount, duplicateCount === 0 ? 'PASS' : 'FAIL');
  console.log('Self-Pairs:', selfPairCount, selfPairCount === 0 ? 'PASS' : 'FAIL');
  console.log('Valid Score Range [40..100]:', validScoreCount, '/', data.pairs.length);

  // Test Resumable Batch Processing: Simulate Next Pending Pair
  console.log('\n--- Resumable Batch Processing Test ---');
  const initialCompleted = data.completedCount;
  console.log(`Current completed dates: ${initialCompleted}`);
  console.log('Triggering POST /api/pairs with { autoNext: true } to test resumable simulation...');

  const batchRes = await fetch('http://localhost:3000/api/pairs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ autoNext: true }),
  });
  const batchData = await batchRes.json();

  console.log('Batch Execution Result:', batchData.success);
  console.log('New Date Simulated:', batchData.data?.personA?.name, '&', batchData.data?.personB?.name);
  console.log('Mutual Score:', batchData.data?.mutualScore, '% | Verdict:', batchData.data?.dateVerdict);
  console.log('New Completed Total Reported:', batchData.progress?.completedCount);
  console.log('Incremented accurately:', batchData.progress?.completedCount === initialCompleted + 1 ? 'PASS' : 'FAIL');
}

testPairMatrix();
