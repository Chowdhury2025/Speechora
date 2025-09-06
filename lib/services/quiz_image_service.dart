import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:path_provider/path_provider.dart';
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

class QuizImageService {
  static QuizImageService? _instance;
  static Future<QuizImageService> get instance async {
    if (_instance == null) {
      _instance = QuizImageService._internal();
      await _instance!._loadPersistedLocalPaths();
    }
    return _instance!;
  }

  QuizImageService._internal();

  final String baseUrl = Constants.baseUrl;
  Map<String, String> localImagePaths = {};

  Future<void> _loadPersistedLocalPaths() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final pathsJson = prefs.getString('local_image_paths');
      if (pathsJson != null) {
        final Map<String, dynamic> data = json.decode(pathsJson);
        localImagePaths = data.map(
          (key, value) => MapEntry(key, value as String),
        );
        print('Loaded ${localImagePaths.length} persisted local paths');
      } else {
        print('No persisted local paths found');
      }
    } catch (e) {
      print('Error loading persisted local paths: $e');
    }
  }

  Future<void> _saveLocalPaths() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final pathsJson = json.encode(localImagePaths);
      await prefs.setString('local_image_paths', pathsJson);
      print('Saved ${localImagePaths.length} local paths to persistence');
    } catch (e) {
      print('Error saving local paths: $e');
    }
  }

  Future<List<QuizImage>> getQuizImages({
    String? category,
    String? ageGroup,
    String? quizType,
  }) async {
    final cacheKey = _generateCacheKey(
      category: category,
      ageGroup: ageGroup,
      quizType: quizType,
    );

    // Try to load from cache first
    final cachedQuizImages = await _loadQuizImagesFromCache(cacheKey);
    if (cachedQuizImages.isNotEmpty) {
      print('Loaded ${cachedQuizImages.length} quiz images from cache');
      // Load local image paths for cached images
      await _loadLocalImagePaths(cachedQuizImages);

      // Check if we have any local images available
      final hasLocalImages = cachedQuizImages.any(
        (image) =>
            localImagePaths.containsKey(image.imageUrl) &&
            File(localImagePaths[image.imageUrl]!).existsSync(),
      );

      if (hasLocalImages) {
        print('Found local images available for offline use');
        return cachedQuizImages;
      } else {
        print('No local images available, will try to download');
        // If no local images are available, try to download them
        try {
          await _downloadImagesLocally(cachedQuizImages);
          return cachedQuizImages;
        } catch (e) {
          print('Failed to download images: $e');
          // Return cached images even if download fails
          return cachedQuizImages;
        }
      }
    }

    final queryParams = <String, String>{};
    if (category != null) queryParams['category'] = category;
    if (ageGroup != null) queryParams['ageGroup'] = ageGroup;
    if (quizType != null) queryParams['quizType'] = quizType;

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
          'Returning cached quiz images due to error: ${cachedQuizImages.length} items',
        );
        // Load local image paths for cached images
        await _loadLocalImagePaths(cachedQuizImages);
        return cachedQuizImages;
      }
      throw Exception('Failed to load quiz images: $e');
    }
  }

  String _generateCacheKey({
    String? category,
    String? ageGroup,
    String? quizType,
  }) {
    final keyParts = <String>[];
    if (category != null) keyParts.add('cat_$category');
    if (ageGroup != null) keyParts.add('age_$ageGroup');
    if (quizType != null) keyParts.add('type_$quizType');
    return keyParts.isEmpty ? 'all_quiz_images' : keyParts.join('_');
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
      await prefs.setString('cached_quiz_images_$cacheKey', quizImagesJson);
      print(
        'Saved ${quizImages.length} quiz images to cache with key: $cacheKey',
      );
    } catch (e) {
      print('Error saving quiz images to cache: $e');
    }
  }

  Future<List<QuizImage>> _loadQuizImagesFromCache(String cacheKey) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final quizImagesJson = prefs.getString('cached_quiz_images_$cacheKey');
      if (quizImagesJson != null) {
        final List<dynamic> data = json.decode(quizImagesJson);
        final quizImages =
            data.map((item) => QuizImage.fromJson(item)).toList();
        return quizImages;
      }
    } catch (e) {
      print('Error loading quiz images from cache: $e');
    }
    return [];
  }

  Future<void> _downloadImagesLocally(List<QuizImage> quizImages) async {
    final directory = await getApplicationDocumentsDirectory();
    print('Downloading images to directory: ${directory.path}');
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
              print('Downloaded and saved: ${image.imageUrl} -> ${file.path}');
            } else {
              print(
                'Failed to download ${image.imageUrl}: ${response.statusCode}',
              );
            }
          } catch (e) {
            print('Error downloading image ${image.imageUrl}: $e');
          }
        }
      }),
    );
    // Save local paths after downloading
    await _saveLocalPaths();
  }

  Future<void> _loadLocalImagePaths(List<QuizImage> quizImages) async {
    final directory = await getApplicationDocumentsDirectory();
    print(
      'Loading local paths for ${quizImages.length} images from directory: ${directory.path}',
    );

    // First, try to load from persisted paths
    await _loadPersistedLocalPaths();

    // Then check which files actually exist and update the map
    for (final image in quizImages) {
      if (image.imageUrl.isNotEmpty) {
        final fileName = image.imageUrl.split('/').last;
        final file = File('${directory.path}/$fileName');
        final exists = await file.exists();
        print('Checking file: ${file.path}, exists: $exists');

        if (exists) {
          localImagePaths[image.imageUrl] = file.path;
          print('Added local path: ${image.imageUrl} -> ${file.path}');
        } else {
          // If file doesn't exist, remove from local paths map
          localImagePaths.remove(image.imageUrl);
          print('Removed non-existent path for: ${image.imageUrl}');
        }
      }
    }
    print('Local paths loaded: ${localImagePaths.length} paths');
    // Save updated local paths
    await _saveLocalPaths();
  }

  String? getLocalImagePath(String imageUrl) {
    final path = localImagePaths[imageUrl];
    print('getLocalImagePath for $imageUrl: $path');

    if (path != null) {
      final file = File(path);
      final exists = file.existsSync();
      print('Local file exists: $exists for path: $path');
      if (!exists) {
        // Remove invalid path from map
        localImagePaths.remove(imageUrl);
        print('Removed invalid path for: $imageUrl');
        return null;
      }
    }

    return path;
  }

  Future<void> ensureImagesDownloaded(List<QuizImage> quizImages) async {
    print('Ensuring images are downloaded for ${quizImages.length} images');

    final directory = await getApplicationDocumentsDirectory();
    int downloadedCount = 0;

    for (final image in quizImages) {
      if (image.imageUrl.isNotEmpty) {
        final fileName = image.imageUrl.split('/').last;
        final file = File('${directory.path}/$fileName');

        if (!await file.exists()) {
          try {
            print('Downloading missing image: ${image.imageUrl}');
            final response = await http.get(Uri.parse(image.imageUrl));
            if (response.statusCode == 200) {
              await file.writeAsBytes(response.bodyBytes);
              localImagePaths[image.imageUrl] = file.path;
              downloadedCount++;
              print('Downloaded: ${image.imageUrl} -> ${file.path}');
            }
          } catch (e) {
            print('Error downloading image ${image.imageUrl}: $e');
          }
        } else {
          // File exists, ensure it's in our local paths map
          localImagePaths[image.imageUrl] = file.path;
        }
      }
    }

    if (downloadedCount > 0) {
      await _saveLocalPaths();
      print('Downloaded $downloadedCount missing images');
    }
  }

  void removeInvalidPath(String imageUrl) {
    localImagePaths.remove(imageUrl);
    print('Removed invalid path for: $imageUrl');
  }
}
