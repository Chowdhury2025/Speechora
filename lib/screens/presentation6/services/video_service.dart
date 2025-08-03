import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/video.dart';
import '../../../constants/constants.dart';

class VideoService {
  static const String apiUrl = Constants.baseUrl;

  static Future<List<Video>> getVideosByCategory(String category) async {
    try {
      final response = await http.post(
        Uri.parse('$apiUrl/videos/category'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'category': category}),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Video.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load videos');
      }
    } catch (e) {
      throw Exception('Error fetching videos: $e');
    }
  }
}
