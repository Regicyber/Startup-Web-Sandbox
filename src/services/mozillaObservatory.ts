import fetch from 'node-fetch';

export async function runMozillaObservatoryScan(url: string) {
  // Extract domain from URL
  const domain = url.replace(/^https?:\/\//, '').split('/')[0];
  const apiUrl = `https://observatory.mozilla.org/api/v1/analyze?host=${domain}`;
  try {
    // Start scan
    const startRes = await fetch(apiUrl, { method: 'POST' });
    if (!startRes.ok) {
      throw new Error('Failed to start Mozilla Observatory scan');
    }
    // Wait for scan to complete
    let scanResult = null;
    for (let i = 0; i < 10; i++) {
      await new Promise(res => setTimeout(res, 3000)); // Wait 3s
      const resultRes = await fetch(`https://observatory.mozilla.org/api/v1/analyze?host=${domain}`);
      if (!resultRes.ok) continue;
      const resultJson = await resultRes.json();
      if (resultJson['end_time']) {
        scanResult = resultJson;
        break;
      }
    }
    if (!scanResult) {
      throw new Error('Mozilla Observatory scan did not complete in time');
    }
    return scanResult;
  } catch (error: any) {
    return { error: error.message || 'Mozilla Observatory scan failed' };
  }
}
