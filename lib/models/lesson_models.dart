import 'dart:convert';

class LessonContent {
  final String type;
  final String content;
  final String? description;

  const LessonContent({
    required this.type,
    required this.content,
    this.description,
  });

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

class Lesson {
  final int id;
  final String title;
  final String? description;
  final String subject;
  final String ageGroup;
  final Map<String, dynamic> statement;
  final List<Map<String, dynamic>> options;

  const Lesson({
    required this.id,
    required this.title,
    this.description,
    required this.subject,
    required this.ageGroup,
    required this.statement,
    required this.options,
  });
  factory Lesson.fromJson(Map<String, dynamic> json) {
    // Parse statement
    final statementData = json['statement'];
    if (statementData == null) {
      throw FormatException('Lesson statement is required but was null');
    }
    final Map<String, dynamic> statementJson =
        statementData is String ? jsonDecode(statementData) : statementData;

    // Parse options
    final optionsData = json['options'];
    if (optionsData == null) {
      throw FormatException('Lesson options are required but was null');
    }
    final List<dynamic> optionsList =
        optionsData is String ? jsonDecode(optionsData) : optionsData;

    return Lesson(
      id: json['id'] as int,
      title: json['title'] as String,
      description: json['description'] as String?,
      subject: json['subject'] as String,
      ageGroup: json['ageGroup'] as String,
      statement: statementJson,
      options: optionsList.cast<Map<String, dynamic>>(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      if (description != null) 'description': description,
      'subject': subject,
      'ageGroup': ageGroup,
      'statement': statement,
      'options': options,
    };
  }
}
