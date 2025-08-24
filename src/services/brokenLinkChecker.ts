// Broken Link Checker (client-side calls server-side API)
export async function checkBrokenLinks(url: string): Promise<any> {
  const apiUrl = `/api/broken-link-checker?url=${encodeURIComponent(url)}`;
  const res = await fetch(apiUrl);
  if (!res.ok) {
    return { error: 'Failed to check broken links' };
  }
  return await res.json();
}
