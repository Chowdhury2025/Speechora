// YouTube video ID extraction and thumbnail URL generation
export const extractVideoId = (url) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

export const getThumbnailUrl = (url, quality = 'maxresdefault') => {
  const videoId = extractVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/${quality}.jpg` : '';
};

// Fetch video title from YouTube
export const getYouTubeVideoTitle = async (url) => {
  const videoId = extractVideoId(url);
  if (!videoId) return null;

  try {
    // Use YouTube's oEmbed endpoint to get video information
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    const data = await response.json();
    return data.title;
  } catch (error) {
    console.error('Failed to fetch YouTube video title:', error);
    return null;
  }
};
