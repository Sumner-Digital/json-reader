// Helper function to get social media platform from URL
export function getSocialPlatform(url: string): { name: string; icon: string } | null {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('facebook.com')) {
    return { name: 'Facebook', icon: '📘' };
  } else if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
    return { name: 'Twitter/X', icon: '🐦' };
  } else if (lowerUrl.includes('instagram.com')) {
    return { name: 'Instagram', icon: '📷' };
  } else if (lowerUrl.includes('linkedin.com')) {
    return { name: 'LinkedIn', icon: '💼' };
  } else if (lowerUrl.includes('youtube.com')) {
    return { name: 'YouTube', icon: '📺' };
  } else if (lowerUrl.includes('pinterest.com')) {
    return { name: 'Pinterest', icon: '📌' };
  } else if (lowerUrl.includes('tiktok.com')) {
    return { name: 'TikTok', icon: '🎵' };
  } else if (lowerUrl.includes('github.com')) {
    return { name: 'GitHub', icon: '🐙' };
  } else if (lowerUrl.includes('wikipedia.org')) {
    return { name: 'Wikipedia', icon: '📚' };
  }
  
  return null;
}
