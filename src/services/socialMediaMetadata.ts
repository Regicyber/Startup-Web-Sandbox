// Social Media Metadata Validation

export async function validateSocialMediaMetadata(url: string): Promise<any> {
  try {
    const apiUrl = `/api/social-media-metadata?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return { error: 'Failed to validate social media metadata' };
    }
    return await response.json();
  } catch (error: any) {
    return { error: error.message };
  }
// ...existing code...
}
