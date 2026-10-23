async function runIngestionTests() {
  console.log('====================================================');
  console.log('      DATEMIND AI — PROFILE INGESTION AUDIT        ');
  console.log('====================================================');

  // Test 1: Invalid URLs
  console.log('\n--- TEST 1: URL Validation (Malformed URLs) ---');
  try {
    const res = await fetch('http://localhost:3000/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Test',
        linkedinUrl: 'https://twitter.com/someone',
        instagramUrl: 'https://notinstagram.com',
      }),
    });
    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Error Reported Honestly:', data.error);
    console.log('Result:', !data.success ? 'PASS (Validation correctly caught bad URLs)' : 'FAIL');
  } catch (err) {
    console.error('Test 1 failed:', err);
  }

  // Test 2: Live URLs blocked by platform anti-bot without fallback
  console.log('\n--- TEST 2: Platform Login Wall Honest Handling (No silent demo substitution) ---');
  try {
    const res = await fetch('http://localhost:3000/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Live Scrape',
        linkedinUrl: 'https://www.linkedin.com/in/testuser992819',
        instagramUrl: 'https://www.instagram.com/testuser992819',
      }),
    });
    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Stage Reported:', data.stage);
    console.log('Requires Fallback Flag:', data.requiresFallback);
    console.log('Error Message:', data.error);
    console.log('Result:', data.requiresFallback ? 'PASS (Honest report of platform wall, did not fake scrape)' : 'FAIL');
  } catch (err) {
    console.error('Test 2 failed:', err);
  }

  // Test 3: Authorized Source Fallback with real Groq LLM profile analysis
  console.log('\n--- TEST 3: Authorized Source Ingestion with Real Groq LLM Analysis ---');
  try {
    const res = await fetch('http://localhost:3000/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Guido van Rossum',
        linkedinUrl: 'https://www.linkedin.com/in/guido-van-rossum-4371408',
        instagramUrl: 'https://www.instagram.com/gvanrossum',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        linkedinFallbackText: 'Creator of Python programming language. Distinguished Engineer at Microsoft. Former BDFL. Passionate about language design, open source, and compilers.',
        instagramFallbackText: 'Python creator. Nature photography, bird watching, hiking trails, coffee and tinkering with hardware. #Python #Birding',
      }),
    });
    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Ingestion Success:', data.success);
    if (data.success) {
      console.log('Generated Person ID:', data.data.id);
      console.log('Profession:', data.data.analysis.profession);
      console.log('Interests:', data.data.analysis.interests);
      console.log('Hobbies:', data.data.analysis.hobbies);
      console.log('Evidence Items Count:', data.data.analysis.evidence.length);
      console.log('Evidence Sources:', data.data.analysis.evidence.map(e => `${e.attribute} (${e.source})`));
      console.log('Unknowns Count:', data.data.analysis.unknowns.length);
      console.log('Source Status:', data.data.sourceStatus);
      console.log('Result: PASS (Real LLM profile analysis executed and stored)');
    } else {
      console.log('Result: FAIL -', data.error);
    }
  } catch (err) {
    console.error('Test 3 failed:', err);
  }
}

runIngestionTests();
