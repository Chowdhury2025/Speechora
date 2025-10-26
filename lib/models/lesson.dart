import 'dart:convert';

class Lesson {
  final int id;
  final String title;
  final String? description;
  final String subject;
  final String ageGroup;
  final Map<String, dynamic> statement;
  final List<Map<String, dynamic>> options;

  Lesson({
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
    final Map<String, dynamic> statementJson =
        statementData is String ? jsonDecode(statementData) : statementData;

    // Parse options
    final optionsData = json['options'];
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
}
