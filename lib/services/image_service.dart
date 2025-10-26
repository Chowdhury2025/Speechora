import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/image_model.dart';
import '../constants/constants.dart';

class ImageService {
  Future<List<ImageModel>> getImages({String? ageGroup}) async {
    try {
      final queryParams = ageGroup != null ? '?ageGroup=$ageGroup' : '';
      final response = await http.get(
        Uri.parse('${Constants.baseUrl}/images$queryParams'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => ImageModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load images');
      }
    } catch (e) {
      throw Exception('Error fetching images: $e');
    }
  }

  Future<ImageModel> getImageById(int id) async {
    try {
      final response = await http.get(
        Uri.parse('${Constants.baseUrl}/images/$id'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        return ImageModel.fromJson(jsonDecode(response.body));
      } else {
        throw Exception('Failed to load image');
      }
    } catch (e) {
      throw Exception('Error fetching image: $e');
    }
  }

  Future<ImageModel> createImage({
    required String imageUrl,
    required String title,
    String? thumbnail,
    String? category,
    int? position,
    String? description,
    String? ageGroup,
    String? name,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isLoggedIn = prefs.getBool('isLoggedIn') ?? false;

      if (!isLoggedIn) {
        throw Exception('Not authenticated');
      }

      final response = await http.post(
        Uri.parse('${Constants.baseUrl}/images'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'imageUrl': imageUrl,
          'title': title,
          'thumbnail': thumbnail,
          'category': category,
          'position': position,
          'description': description,
          'ageGroup': ageGroup,
          'name': name,
        }),
      );

      if (response.statusCode == 201) {
        return ImageModel.fromJson(jsonDecode(response.body));
      } else {
        throw Exception('Failed to create image');
      }
    } catch (e) {
      throw Exception('Error creating image: $e');
    }
  }

  Future<ImageModel> updateImage(
    int id, {
    String? imageUrl,
    String? title,
    String? thumbnail,
    String? category,
    int? position,
    String? description,
    String? ageGroup,
    String? name,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isLoggedIn = prefs.getBool('isLoggedIn') ?? false;

      if (!isLoggedIn) {
        throw Exception('Not authenticated');
      }

      final Map<String, dynamic> updateData = {
        if (imageUrl != null) 'imageUrl': imageUrl,
        if (title != null) 'title': title,
        if (thumbnail != null) 'thumbnail': thumbnail,
        if (category != null) 'category': category,
        if (position != null) 'position': position,
        if (description != null) 'description': description,
        if (ageGroup != null) 'ageGroup': ageGroup,
        if (name != null) 'name': name,
      };

      final response = await http.put(
        Uri.parse('${Constants.baseUrl}/images/$id'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(updateData),
      );

      if (response.statusCode == 200) {
        return ImageModel.fromJson(jsonDecode(response.body));
      } else {
        throw Exception('Failed to update image');
      }
    } catch (e) {
      throw Exception('Error updating image: $e');
    }
  }

  Future<void> deleteImage(int id) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isLoggedIn = prefs.getBool('isLoggedIn') ?? false;

      if (!isLoggedIn) {
        throw Exception('Not authenticated');
      }

      final response = await http.delete(
        Uri.parse('${Constants.baseUrl}/images/$id'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to delete image');
      }
    } catch (e) {
      throw Exception('Error deleting image: $e');
    }
  }
}
