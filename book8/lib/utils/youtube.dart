String extractVideoId(String url) {
  if (url.isEmpty) return '';

  final RegExp regExp = RegExp(
    r'^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*',
  );
  final Match? match = regExp.firstMatch(url);
  return match?.group(1) ?? '';
}

String getThumbnailUrl(String url, {String quality = 'maxresdefault'}) {
  final videoId = extractVideoId(url);
  if (videoId.isEmpty) return '';
  return 'https://img.youtube.com/vi/$videoId/$quality.jpg';
}
