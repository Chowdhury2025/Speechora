import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:path_provider/path_provider.dart';
import '../constants/constants.dart';

class Presentation3Item {
  final int id;
  final String subject;
  final String imageUrl1;
  final String imageUrl2;
  final String imageName1;
  final String imageName2;
  final String description;
  final String ageGroup;

  Presentation3Item({
    required this.id,
    required this.subject,
    required this.imageUrl1,
    required this.imageUrl2,
    required this.imageName1,
    required this.imageName2,
    required this.description,
    required this.ageGroup,
  });

  factory Presentation3Item.fromJson(Map<String, dynamic> json) {
    return Presentation3Item(
      id: json['id'],
      subject: json['subject'],
      imageUrl1: json['imageUrl1'],
      imageUrl2: json['imageUrl2'],
      imageName1: json['imageName1'],
      imageName2: json['imageName2'],
      description: json['description'],
      ageGroup: json['ageGroup'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'subject': subject,
      'imageUrl1': imageUrl1,
      'imageUrl2': imageUrl2,
      'imageName1': imageName1,
      'imageName2': imageName2,
      'description': description,
      'ageGroup': ageGroup,
    };
  }
}

class Presentation3Service {
  static Presentation3Service? _instance;
  static Future<Presentation3Service> get instance async {
    if (_instance == null) {
      _instance = Presentation3Service._internal();
      await _instance!._loadPersistedLocalPaths();
    }
    return _instance!;
  }

  Presentation3Service._internal();

  final String baseUrl = Constants.baseUrl;
  Map<String, String> localImagePaths = {};

  Future<void> _loadPersistedLocalPaths() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final pathsJson = prefs.getString('presentation3_local_image_paths');
      if (pathsJson != null) {
        final Map<String, dynamic> data = json.decode(pathsJson);
        localImagePaths = data.map(
          (key, value) => MapEntry(key, value as String),
        );
        print('Loaded ${localImagePaths.length} persisted presentation3 local paths');
      } else {
        print('No persisted presentation3 local paths found');
      }
    } catch (e) {
      print('Error loading persisted presentation3 local paths: $e');
    }
  }

  Future<void> _saveLocalPaths() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final pathsJson = json.encode(localImagePaths);
      await prefs.setString('presentation3_local_image_paths', pathsJson);
      print('Saved ${localImagePaths.length} presentation3 local paths to persistence');
    } catch (e) {
      print('Error saving presentation3 local paths: $e');
    }
  }

  Future<List<Presentation3Item>> getPresentation3Items({
    String? subject,
    String? ageGroup,
  }) async {
    final cacheKey = _generateCacheKey(subject: subject, ageGroup: ageGroup);

    // Try to load from cache first
    final cachedItems = await _loadItemsFromCache(cacheKey);
    if (cachedItems.isNotEmpty) {
      print('Loaded ${cachedItems.length} presentation3 items from cache');
      // Load local image paths for cached items
      await _loadLocalImagePaths(cachedItems);

      // Check if we have any local images available
      final hasLocalImages = cachedItems.any((item) =>
          (localImagePaths.containsKey(item.imageUrl1) &&
              File(localImagePaths[item.imageUrl1]!).existsSync()) ||
          (localImagePaths.containsKey(item.imageUrl2) &&
              File(localImagePaths[item.imageUrl2]!).existsSync()));

      if (hasLocalImages) {
        print('Found local images available for offline use');
        return cachedItems;
      } else {
        print('No local images available, will try to download');
        // If no local images are available, try to download them
        try {
          await _downloadImagesLocally(cachedItems);
          return cachedItems;
        } catch (e) {
          print('Failed to download images: $e');
          // Return cached items even if download fails
          return cachedItems;
        }
      }
    }

    final queryParams = <String, String>{};
    if (subject != null) queryParams['subject'] = subject;
    if (ageGroup != null) queryParams['ageGroup'] = ageGroup;

    final uri = Uri.parse('$baseUrl/presentation3')
        .replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);

    try {
      final response = await http.get(uri);
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        final items = jsonData.map((json) => Presentation3Item.fromJson(json)).toList();

        // Save to cache
        await _saveItemsToCache(cacheKey, items);

        // Download images locally
        await _downloadImagesLocally(items);

        return items;
      } else {
        throw Exception('Failed to load presentation3 items: ${response.statusCode}');
      }
    } catch (e) {
      // Try to return cached data even if it's stale
      final cachedItems = await _loadItemsFromCache(cacheKey);
      if (cachedItems.isNotEmpty) {
        print('Returning cached presentation3 items due to error: ${cachedItems.length} items');
        // Load local image paths for cached items
        await _loadLocalImagePaths(cachedItems);
        return cachedItems;
      }
      throw Exception('Failed to load presentation3 items: $e');
    }
  }

  String _generateCacheKey({String? subject, String? ageGroup}) {
    final keyParts = <String>[];
    if (subject != null) keyParts.add('subject_$subject');
    if (ageGroup != null) keyParts.add('age_$ageGroup');
    return keyParts.isEmpty ? 'all_presentation3_items' : keyParts.join('_');
  }

  Future<void> _saveItemsToCache(String cacheKey, List<Presentation3Item> items) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final itemsJson = json.encode(items.map((item) => item.toJson()).toList());
      await prefs.setString('cached_presentation3_$cacheKey', itemsJson);
      print('Saved ${items.length} presentation3 items to cache with key: $cacheKey');
    } catch (e) {
      print('Error saving presentation3 items to cache: $e');
    }
  }

  Future<List<Presentation3Item>> _loadItemsFromCache(String cacheKey) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final itemsJson = prefs.getString('cached_presentation3_$cacheKey');
      if (itemsJson != null) {
        final List<dynamic> data = json.decode(itemsJson);
        final items = data.map((item) => Presentation3Item.fromJson(item)).toList();
        return items;
      }
    } catch (e) {
      print('Error loading presentation3 items from cache: $e');
    }
    return [];
  }

  Future<void> _downloadImagesLocally(List<Presentation3Item> items) async {
    final directory = await getApplicationDocumentsDirectory();
    final presentation3Dir = Directory('${directory.path}/presentation3');
    if (!await presentation3Dir.exists()) {
      await presentation3Dir.create(recursive: true);
    }
    
    print('Downloading presentation3 images to directory: ${presentation3Dir.path}');
    
    final downloadTasks = <Future>[];
    
    for (final item in items) {
      // Download image1
      if (item.imageUrl1.isNotEmpty) {
        downloadTasks.add(_downloadSingleImage(item.imageUrl1, presentation3Dir.path));
      }
      // Download image2
      if (item.imageUrl2.isNotEmpty) {
        downloadTasks.add(_downloadSingleImage(item.imageUrl2, presentation3Dir.path));
      }
    }
    
    await Future.wait(downloadTasks);
    // Save local paths after downloading
    await _saveLocalPaths();
  }

  Future<void> _downloadSingleImage(String imageUrl, String directoryPath) async {
    try {
      final response = await http.get(Uri.parse(imageUrl));
      if (response.statusCode == 200) {
        final fileName = imageUrl.split('/').last;
        final file = File('$directoryPath/$fileName');
        await file.writeAsBytes(response.bodyBytes);
        localImagePaths[imageUrl] = file.path;
        print('Downloaded and saved: $imageUrl -> ${file.path}');
      } else {
        print('Failed to download $imageUrl: ${response.statusCode}');
      }
    } catch (e) {
      print('Error downloading image $imageUrl: $e');
    }
  }

  Future<void> _loadLocalImagePaths(List<Presentation3Item> items) async {
    final directory = await getApplicationDocumentsDirectory();
    final presentation3Dir = Directory('${directory.path}/presentation3');
    print('Loading local paths for ${items.length} items from directory: ${presentation3Dir.path}');

    // First, try to load from persisted paths
    await _loadPersistedLocalPaths();

    // Then check which files actually exist and update the map
    for (final item in items) {
      // Check image1
      if (item.imageUrl1.isNotEmpty) {
        final fileName1 = item.imageUrl1.split('/').last;
        final file1 = File('${presentation3Dir.path}/$fileName1');
        if (await file1.exists()) {
          localImagePaths[item.imageUrl1] = file1.path;
          print('Added local path: ${item.imageUrl1} -> ${file1.path}');
        } else {
          localImagePaths.remove(item.imageUrl1);
          print('Removed non-existent path for: ${item.imageUrl1}');
        }
      }
      
      // Check image2
      if (item.imageUrl2.isNotEmpty) {
        final fileName2 = item.imageUrl2.split('/').last;
        final file2 = File('${presentation3Dir.path}/$fileName2');
        if (await file2.exists()) {
          localImagePaths[item.imageUrl2] = file2.path;
          print('Added local path: ${item.imageUrl2} -> ${file2.path}');
        } else {
          localImagePaths.remove(item.imageUrl2);
          print('Removed non-existent path for: ${item.imageUrl2}');
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

  Future<void> ensureImagesDownloaded(List<Presentation3Item> items) async {
    print('Ensuring images are downloaded for ${items.length} items');

    final directory = await getApplicationDocumentsDirectory();
    final presentation3Dir = Directory('${directory.path}/presentation3');
    if (!await presentation3Dir.exists()) {
      await presentation3Dir.create(recursive: true);
    }

    int downloadedCount = 0;

    for (final item in items) {
      // Check and download image1
      if (item.imageUrl1.isNotEmpty) {
        final fileName1 = item.imageUrl1.split('/').last;
        final file1 = File('${presentation3Dir.path}/$fileName1');

        if (!await file1.exists()) {
          try {
            print('Downloading missing image: ${item.imageUrl1}');
            final response = await http.get(Uri.parse(item.imageUrl1));
            if (response.statusCode == 200) {
              await file1.writeAsBytes(response.bodyBytes);
              localImagePaths[item.imageUrl1] = file1.path;
              downloadedCount++;
              print('Downloaded: ${item.imageUrl1} -> ${file1.path}');
            }
          } catch (e) {
            print('Error downloading image ${item.imageUrl1}: $e');
          }
        } else {
          // File exists, ensure it's in our local paths map
          localImagePaths[item.imageUrl1] = file1.path;
        }
      }

      // Check and download image2
      if (item.imageUrl2.isNotEmpty) {
        final fileName2 = item.imageUrl2.split('/').last;
        final file2 = File('${presentation3Dir.path}/$fileName2');

        if (!await file2.exists()) {
          try {
            print('Downloading missing image: ${item.imageUrl2}');
            final response = await http.get(Uri.parse(item.imageUrl2));
            if (response.statusCode == 200) {
              await file2.writeAsBytes(response.bodyBytes);
              localImagePaths[item.imageUrl2] = file2.path;
              downloadedCount++;
              print('Downloaded: ${item.imageUrl2} -> ${file2.path}');
            }
          } catch (e) {
            print('Error downloading image ${item.imageUrl2}: $e');
          }
        } else {
          // File exists, ensure it's in our local paths map
          localImagePaths[item.imageUrl2] = file2.path;
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

  /// Clear all cached data and downloaded files - useful for refresh
  Future<void> clearAllData() async {
    try {
      // Clear cached API responses
      final prefs = await SharedPreferences.getInstance();
      final keys = prefs.getKeys().where((key) => key.startsWith('cached_presentation3_')).toList();
      for (final key in keys) {
        await prefs.remove(key);
      }
      
      // Clear local image paths from storage
      await prefs.remove('presentation3_local_image_paths');
      
      // Clear local images directory
      final directory = await getApplicationDocumentsDirectory();
      final presentation3Dir = Directory('${directory.path}/presentation3');
      if (await presentation3Dir.exists()) {
        await presentation3Dir.delete(recursive: true);
      }
      
      // Clear in-memory paths
      localImagePaths.clear();
      
      print('Cleared all presentation3 cached data and files');
    } catch (e) {
      print('Error clearing presentation3 data: $e');
    }
  }
}