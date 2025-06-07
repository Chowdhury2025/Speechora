// YouTube video ID extraction and thumbnail URL generation
export const extractVideoId = (url) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

export const getThumbnailUrl = (url, quality = 'maxresdefault') => {
  const videoId = extractVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/${quality}.jpg` : '';
};
