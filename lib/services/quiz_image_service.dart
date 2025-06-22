import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants/constants.dart';

class QuizImage {
  final int id;
  final String imageUrl;
  final String name;
  final String category;
  final String ageGroup;
  final List<String> quizTypes;

  QuizImage({
    required this.id,
    required this.imageUrl,
    required this.name,
    required this.category,
    required this.ageGroup,
    required this.quizTypes,
  });

  factory QuizImage.fromJson(Map<String, dynamic> json) {
    return QuizImage(
      id: json['id'],
      imageUrl: json['imageUrl'],
      name: json['name'],
      category: json['category'],
      ageGroup: json['ageGroup'],
      quizTypes: List<String>.from(json['quizTypes'] ?? []),
    );
  }
}

class QuizImageService {
  final String baseUrl = Constants.baseUrl;

  Future<List<QuizImage>> getQuizImages({
    String? category,
    String? ageGroup,
    String? quizType,
  }) async {
    final queryParams = <String, String>{};
    if (category != null) queryParams['category'] = category;
    if (ageGroup != null) queryParams['ageGroup'] = ageGroup;
    if (quizType != null) queryParams['quizType'] = quizType;

    final uri = Uri.parse(
      '$baseUrl/quiz-images',
    ).replace(queryParameters: queryParams);
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final List<dynamic> jsonData = json.decode(response.body);
      return jsonData.map((json) => QuizImage.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load quiz images');
    }
  }
}
