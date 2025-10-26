class LessonContent {
  final String type;
  final String content;
  final String? description;

  LessonContent({required this.type, required this.content, this.description});

  factory LessonContent.fromJson(Map<String, dynamic> json) {
    return LessonContent(
      type: json['type'] as String,
      content: json['content'] as String,
      description: json['description'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'content': content,
      if (description != null) 'description': description,
    };
  }
}
