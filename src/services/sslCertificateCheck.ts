// SSL Certificate Check (client-side calls server-side API)
export async function checkSslCertificate(domain: string): Promise<any> {
  try {
    const apiUrl = `/api/ssl-certificate-check?domain=${encodeURIComponent(domain)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return { error: 'Failed to check SSL certificate' };
    }
    return await response.json();
  } catch (error: any) {
    return { error: error.message };
  }
}
