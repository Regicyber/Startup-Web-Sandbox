// Security Scan & Vulnerability Check (client-side calls server-side API)
export async function runSecurityScan(url: string): Promise<any> {
  const apiUrl = `/api/security-scan?url=${encodeURIComponent(url)}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    return { error: 'Failed to run security scan' };
  }
  return await response.json();
}
