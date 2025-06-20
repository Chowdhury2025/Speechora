import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants/constants.dart';

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
    return Lesson(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      subject: json['subject'],
      ageGroup: json['ageGroup'],
      statement: json['statement'],
      options: List<Map<String, dynamic>>.from(json['options']),
    );
  }
}

class LessonService {
  static Future<List<Lesson>> getLessonsBySubject(String subject) async {
    try {
      final response = await http.get(
        Uri.parse('${Constants.baseUrl}/lessons?subject=$subject'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Lesson.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load lessons');
      }
    } catch (e) {
      throw Exception('Failed to connect to the server');
    }
  }
}
