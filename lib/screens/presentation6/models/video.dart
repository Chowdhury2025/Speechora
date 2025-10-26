class Video {
  final String id;
  final String title;
  final String? name;
  final String? description;
  final String? video_url;
  final String? linkyoutube_link;
  final String thumbnailUrl;

  Video({
    required this.id,
    required this.title,
    this.name,
    this.description,
    this.video_url,
    this.linkyoutube_link,
    required this.thumbnailUrl,
  });

  factory Video.fromJson(Map<String, dynamic> json) {
    String thumbnailUrl = '';
    if (json['linkyoutube_link'] != null &&
        json['linkyoutube_link'].isNotEmpty) {
      final regExp = RegExp(
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
      );
      final match = regExp.firstMatch(json['linkyoutube_link']);
      if (match != null) {
        final videoId = match.group(1);
        thumbnailUrl = 'https://img.youtube.com/vi/$videoId/maxresdefault.jpg';
      }
    }

    return Video(
      id: json['id'].toString(),
      title: json['title'] ?? '',
      name: json['name'],
      description: json['description'],
      video_url: json['video_url'],
      linkyoutube_link: json['linkyoutube_link'],
      thumbnailUrl: thumbnailUrl,
    );
  }
}
