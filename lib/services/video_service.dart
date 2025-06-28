import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:book8/constants/constants.dart';
import 'package:book8/utils/youtube.dart';

class VideoService {
  // Update this with your actual backend URL
  static String baseUrl = Constants.baseUrl;

  // Map Flutter category names to backend slugs
  static String getCategorySlug(String category) {
    final Map<String, String> categoryMap = {
      'My World & Daily Life': 'my_world_daily_life',
      'Home': 'home',
      'School': 'school',
      'Therapy': 'therapy',
      'Activities': 'activities',
      'Family & Friends': 'family_friends',
      'Toys & Games': 'toys_games',
      'Food & Drink': 'food_drink',
      'Places': 'places',
      'I Want / Needs': 'i_want_needs',
      'Actions / Verbs': 'actions_verbs',
      'What Questions': 'what_questions',
      'Where Questions': 'where_questions',
      'Who Questions': 'who_questions',
      'When Questions': 'when_questions',
      'Why Questions': 'why_questions',
      'How Questions': 'how_questions',
      'Choice Questions': 'choice_questions',
      'Question Starters': 'question_starters',
      'Others': 'others',
    };
    return categoryMap[category] ?? category;
  }

  static Future<List<Video>> getVideosByCategory(String category) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/videos/category'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'category': getCategorySlug(category)}),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((video) => Video.fromJson(video)).toList();
      } else {
        throw Exception('Failed to load videos: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to connect to server: $e');
    }
  }

  static Future<List<String>> getAllCategories() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/videos/categories'),
        headers: {'Content-Type': 'application/json'},
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.cast<String>();
      } else {
        throw Exception('Failed to load categories: \\${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to connect to server: $e');
    }
  }
}

class Video {
  final String title;
  final String linkyoutube_link;
  final String? description;
  final String? category;
  final String? ageGroup;
  final String? name;

  Video({
    required this.title,
    required this.linkyoutube_link,
    this.description,
    this.category,
    this.ageGroup,
    this.name,
  });

  String get thumbnailUrl => getThumbnailUrl(linkyoutube_link);
  String get fallbackThumbnailUrl =>
      getThumbnailUrl(linkyoutube_link, quality: 'hqdefault');

  factory Video.fromJson(Map<String, dynamic> json) {
    return Video(
      title: json['title'] as String,
      linkyoutube_link: json['linkyoutube_link'] as String,
      description: json['description'] as String?,
      category: json['category'] as String?,
      ageGroup: json['ageGroup'] as String?,
      name: json['name'] as String?,
    );
  }
}
