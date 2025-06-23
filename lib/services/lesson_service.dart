import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants/constants.dart';
import '../models/lesson_models.dart';

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
