// Domain & DNS Information

// Domain & DNS Information (client-side calls server-side API)
export async function getDomainDnsInfo(domain: string): Promise<any> {
  const apiUrl = `/api/domain-dns-info?domain=${encodeURIComponent(domain)}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    return { error: 'Failed to get domain & DNS info' };
  }
  return await response.json();
}
