import 'lesson_content.dart';

class Lesson {
  final int id;
  final String title;
  final String? description;
  final String subject;
  final String ageGroup;
  final LessonContent statement;
  final List<LessonContent> options;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int userId;

  Lesson({
    required this.id,
    required this.title,
    this.description,
    required this.subject,
    required this.ageGroup,
    required this.statement,
    required this.options,
    required this.createdAt,
    required this.updatedAt,
    required this.userId,
  });

  factory Lesson.fromJson(Map<String, dynamic> json) {
    return Lesson(
      id: json['id'] as int,
      title: json['title'] as String,
      description: json['description'] as String?,
      subject: json['subject'] as String,
      ageGroup: json['ageGroup'] as String,
      statement: LessonContent.fromJson(json['statement']),
      options:
          (json['options'] as List)
              .map((option) => LessonContent.fromJson(option))
              .toList(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      userId: json['userId'] as int,
    );
  }
}
