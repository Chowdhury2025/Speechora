import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants/constants.dart';

class LessonContent {
  final String text;
  final String? imageUrl;

  LessonContent({required this.text, this.imageUrl});

  factory LessonContent.fromJson(Map<String, dynamic> json) {
    print('Parsing LessonContent: $json');
    final String type = json['type'] as String;
    final String content = json['content'] as String;

    if (type.contains('image')) {
      return LessonContent(
        text: json['description'] as String? ?? 'Image',
        imageUrl: content,
      );
    } else {
      return LessonContent(text: content, imageUrl: null);
    }
  }
}

class Lesson {
  final int id;
  final String title;
  final String? description;
  final String subject;
  final String ageGroup;
  final LessonContent statement;
  final List<LessonContent> options;

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
    print('Parsing lesson: $json');

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
      statement: LessonContent.fromJson(statementJson),
      options:
          optionsList
              .map(
                (option) => LessonContent.fromJson(
                  option is String ? jsonDecode(option) : option,
                ),
              )
              .toList(),
    );
  }
}

class LessonService {
  static Future<List<Lesson>> getLessonsBySubject(String subject) async {
    try {
      print('Fetching lessons for subject: $subject');
      final response = await http.get(
        Uri.parse('${Constants.baseUrl}/lessons/subject/$subject'),
        headers: {'Content-Type': 'application/json'},
      );
      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        print('Parsed response data: $responseData');

        if (!responseData.containsKey('lessons')) {
          print('No lessons key in response');
          return [];
        }

        final List<dynamic> data = responseData['lessons'];
        if (data.isEmpty) {
          print('No lessons found');
          return [];
        }

        final lessons =
            data.map((item) {
              try {
                return Lesson.fromJson(item);
              } catch (e) {
                print('Error parsing lesson: $e');
                print('Problem item: $item');
                rethrow;
              }
            }).toList();

        print('Successfully parsed ${lessons.length} lessons');
        return lessons;
      }

      throw Exception('Failed to load lessons: ${response.statusCode}');
    } catch (e) {
      print('Error in getLessonsBySubject: $e');
      throw Exception('Failed to load lessons: $e');
    }
  }
}
