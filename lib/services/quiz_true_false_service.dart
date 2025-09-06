import 'dart:convert';
import 'dart:io';
import 'package:book8/constants/constants.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:path_provider/path_provider.dart';

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
      quizTypes: List<String>.from(json['quizTypes']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'imageUrl': imageUrl,
      'name': name,
      'category': category,
      'ageGroup': ageGroup,
      'quizTypes': quizTypes,
    };
  }
}

class QuizTrueFalseService {
  final String baseUrl = Constants.baseUrl;
  Map<String, String> localImagePaths = {};

  Future<List<QuizImage>> getQuizImages({
    String? category,
    String? ageGroup,
  }) async {
    final cacheKey = _generateCacheKey(category: category, ageGroup: ageGroup);

    // Try to load from cache first
    final cachedQuizImages = await _loadQuizImagesFromCache(cacheKey);
    if (cachedQuizImages.isNotEmpty) {
      print(
        'Loaded ${cachedQuizImages.length} true/false quiz images from cache',
      );
      // Load local image paths for cached images
      await _loadLocalImagePaths(cachedQuizImages);
      return cachedQuizImages;
    }

    final queryParams = <String, String>{'quizType': 'true_false'};
    if (category != null) queryParams['category'] = category;
    if (ageGroup != null) queryParams['ageGroup'] = ageGroup;

    final uri = Uri.parse(
      '$baseUrl/quiz-images',
    ).replace(queryParameters: queryParams);

    try {
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        final quizImages =
            jsonData.map((json) => QuizImage.fromJson(json)).toList();

        // Save to cache
        await _saveQuizImagesToCache(cacheKey, quizImages);

        // Download images locally
        await _downloadImagesLocally(quizImages);

        return quizImages;
      } else {
        throw Exception('Failed to load quiz images');
      }
    } catch (e) {
      // Try to return cached data even if it's stale
      final cachedQuizImages = await _loadQuizImagesFromCache(cacheKey);
      if (cachedQuizImages.isNotEmpty) {
        print(
          'Returning cached true/false quiz images due to error: ${cachedQuizImages.length} items',
        );
        // Load local image paths for cached images
        await _loadLocalImagePaths(cachedQuizImages);
        return cachedQuizImages;
      }
      throw Exception('Failed to load quiz images: $e');
    }
  }

  String _generateCacheKey({String? category, String? ageGroup}) {
    final keyParts = <String>['true_false'];
    if (category != null) keyParts.add('cat_$category');
    if (ageGroup != null) keyParts.add('age_$ageGroup');
    return keyParts.join('_');
  }

  Future<void> _saveQuizImagesToCache(
    String cacheKey,
    List<QuizImage> quizImages,
  ) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final quizImagesJson = json.encode(
        quizImages.map((quiz) => quiz.toJson()).toList(),
      );
      await prefs.setString('cached_quiz_tf_$cacheKey', quizImagesJson);
      print(
        'Saved ${quizImages.length} true/false quiz images to cache with key: $cacheKey',
      );
    } catch (e) {
      print('Error saving true/false quiz images to cache: $e');
    }
  }

  Future<List<QuizImage>> _loadQuizImagesFromCache(String cacheKey) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final quizImagesJson = prefs.getString('cached_quiz_tf_$cacheKey');
      if (quizImagesJson != null) {
        final List<dynamic> data = json.decode(quizImagesJson);
        final quizImages =
            data.map((item) => QuizImage.fromJson(item)).toList();
        return quizImages;
      }
    } catch (e) {
      print('Error loading true/false quiz images from cache: $e');
    }
    return [];
  }

  Future<void> _downloadImagesLocally(List<QuizImage> quizImages) async {
    final directory = await getApplicationDocumentsDirectory();
    await Future.wait(
      quizImages.map((image) async {
        if (image.imageUrl.isNotEmpty) {
          try {
            final response = await http.get(Uri.parse(image.imageUrl));
            if (response.statusCode == 200) {
              final fileName = image.imageUrl.split('/').last;
              final file = File('${directory.path}/$fileName');
              await file.writeAsBytes(response.bodyBytes);
              localImagePaths[image.imageUrl] = file.path;
            }
          } catch (e) {
            print('Error downloading image: $e');
          }
        }
      }),
    );
  }

  Future<void> _loadLocalImagePaths(List<QuizImage> quizImages) async {
    final directory = await getApplicationDocumentsDirectory();
    for (final image in quizImages) {
      if (image.imageUrl.isNotEmpty) {
        final fileName = image.imageUrl.split('/').last;
        final file = File('${directory.path}/$fileName');
        if (await file.exists()) {
          localImagePaths[image.imageUrl] = file.path;
        }
      }
    }
  }

  String? getLocalImagePath(String imageUrl) {
    return localImagePaths[imageUrl];
  }
}
