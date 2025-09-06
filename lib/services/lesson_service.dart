import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/constants.dart';
import '../models/lesson_models.dart';

class LessonService {
  static Future<List<Lesson>> getLessonsBySubject(String subject) async {
    try {
      // Try to load from cache first
      final cachedLessons = await _loadLessonsFromCache(subject);
      if (cachedLessons.isNotEmpty) {
        print('Loaded ${cachedLessons.length} lessons from cache for subject: $subject');
        return cachedLessons;
      }

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
        
        // Save to cache
        await _saveLessonsToCache(subject, lessons);
        
        return lessons;
      }

      throw Exception('Failed to load lessons: ${response.statusCode}');
    } catch (e) {
      print('Error in getLessonsBySubject: $e');
      
      // Try to return cached data even if it's stale
      final cachedLessons = await _loadLessonsFromCache(subject);
      if (cachedLessons.isNotEmpty) {
        print('Returning cached lessons due to error: ${cachedLessons.length} lessons');
        return cachedLessons;
      }
      
      throw Exception('Failed to load lessons: $e');
    }
  }

  static Future<void> _saveLessonsToCache(String subject, List<Lesson> lessons) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final lessonsJson = json.encode(lessons.map((lesson) => lesson.toJson()).toList());
      await prefs.setString('cached_lessons_$subject', lessonsJson);
      print('Saved ${lessons.length} lessons to cache for subject: $subject');
    } catch (e) {
      print('Error saving lessons to cache: $e');
    }
  }

  static Future<List<Lesson>> _loadLessonsFromCache(String subject) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final lessonsJson = prefs.getString('cached_lessons_$subject');
      if (lessonsJson != null) {
        final List<dynamic> data = json.decode(lessonsJson);
        final lessons = data.map((item) => Lesson.fromJson(item)).toList();
        return lessons;
      }
    } catch (e) {
      print('Error loading lessons from cache: $e');
    }
    return [];
  }
}
