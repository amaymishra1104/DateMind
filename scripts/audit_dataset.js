const fs = require('fs');

const profiles = JSON.parse(fs.readFileSync('data/profiles.json', 'utf8'));

console.log('====================================================');
console.log('    DATEMIND AI — 25-PERSON DATASET RIGOROUS AUDIT  ');
console.log('====================================================');
console.log('Total Records Found:', profiles.length);

let totalEvidenceItems = 0;
let totalUnknowns = 0;
let validLinkedinCount = 0;
let validInstagramCount = 0;
let identityVerifiedCount = 0;

const auditTable = [];

profiles.forEach((p, idx) => {
  const isLI = p.linkedinUrl && /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/i.test(p.linkedinUrl);
  const isIG = p.instagramUrl && /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/i.test(p.instagramUrl);
  if (isLI) validLinkedinCount++;
  if (isIG) validInstagramCount++;
  if (p.identityVerified) identityVerifiedCount++;

  const evList = p.analysis?.evidence || [];
  totalEvidenceItems += evList.length;
  const unkList = p.analysis?.unknowns || [];
  totalUnknowns += unkList.length;

  const sourcesUsed = [...new Set(evList.map(e => e.source))];
  const allSourcesPermitted = sourcesUsed.every(s => s === 'linkedin' || s === 'instagram');

  auditTable.push({
    id: p.id,
    name: p.name,
    profession: p.analysis?.profession?.split('|')[0]?.trim() || 'N/A',
    liUrl: p.linkedinUrl,
    igUrl: p.instagramUrl,
    liValid: isLI,
    igValid: isIG,
    evidenceCount: evList.length,
    sourcesUsed: sourcesUsed.join('+'),
    sourcesPermitted: allSourcesPermitted,
    unknownsCount: unkList.length,
    status: p.sourceStatus,
    verificationNotes: p.verificationNotes,
  });
});

console.log('\nAudit Summary:');
console.log('- Total Profiles:', profiles.length, '(Requirement: >= 25) ->', profiles.length >= 25 ? 'PASS' : 'FAIL');
console.log('- Valid LinkedIn URLs:', validLinkedinCount, '/', profiles.length);
console.log('- Valid Instagram URLs:', validInstagramCount, '/', profiles.length);
console.log('- Identity Verified:', identityVerifiedCount, '/', profiles.length);
console.log('- Total Evidence Items Cited:', totalEvidenceItems);
console.log('- Total Unknowns Documented:', totalUnknowns);

console.log('\nDetailed 25 People Ledger:');
auditTable.forEach((r, i) => {
  console.log(`[${i+1}] ${r.id}: ${r.name} | LI: ${r.liValid ? 'VALID' : 'INVALID'} | IG: ${r.igValid ? 'VALID' : 'INVALID'} | Evidence: ${r.evidenceCount} (${r.sourcesUsed}) | Status: ${r.status}`);
});
