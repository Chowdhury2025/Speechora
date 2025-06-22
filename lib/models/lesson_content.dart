class LessonContent {
  final String type;
  final String text;
  final String? imageUrl;
  final String? videoUrl;

  LessonContent({
    required this.type,
    required this.text,
    this.imageUrl,
    this.videoUrl,
  });

  factory LessonContent.fromJson(Map<String, dynamic> json) {
    return LessonContent(
      type: json['type'] as String,
      text: json['content'] as String,
      imageUrl:
          json['type'].toString().contains('image')
              ? json['content'] as String
              : null,
      videoUrl:
          json['type'].toString().contains('video')
              ? json['content'] as String
              : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'content':
          type.contains('image')
              ? imageUrl
              : type.contains('video')
              ? videoUrl
              : text,
    };
  }
}
