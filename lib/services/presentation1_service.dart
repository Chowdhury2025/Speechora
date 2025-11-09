import 'package:speachora/constants/constants.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
import 'dart:math' as math;
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:crypto/crypto.dart';

class Presentation1Service {
  static final Presentation1Service _instance = Presentation1Service._internal();
  factory Presentation1Service() => _instance;
  Presentation1Service._internal();

  // Cache for all images
  List<Map<String, dynamic>> _allImages = [];
  Map<String, String> _localImagePaths = {};
  bool _isInitialized = false;
  bool _isLoading = false;

  // Secure storage directories
  Directory? _secureJsonDir;
  Directory? _secureImagesDir;

  // Available categories for Presentation 1
  static const List<String> presentation1Categories = [
    'my_world_daily_life',
    'home',
    'school',
    'therapy',
    'activities',
    'family_friends',
    'toys_games',
    'food_drink',
    'places',
  ];

  // Initialize secure directories
  Future<void> _initializeSecureDirectories() async {
    if (_secureJsonDir != null && _secureImagesDir != null) return;

    // Use app's internal directory - completely hidden from user
    final appDir = await getApplicationSupportDirectory();
    
    // Create hidden subdirectories for our data
    _secureJsonDir = Directory('${appDir.path}/.app_data/json_cache');
    _secureImagesDir = Directory('${appDir.path}/.app_data/images_cache');

    // Create directories if they don't exist
    await _secureJsonDir!.create(recursive: true);
    await _secureImagesDir!.create(recursive: true);

    print('Secure storage initialized:');
    print('JSON Cache: ${_secureJsonDir!.path}');
    print('Images Cache: ${_secureImagesDir!.path}');
  }

  // Generate secure filename using hash
  String _generateSecureFileName(String url) {
    final bytes = utf8.encode(url);
    final digest = sha256.convert(bytes);
    final extension = url.split('.').last.toLowerCase();
    return '${digest.toString().substring(0, 16)}.$extension';
  }

  // Get current user's selected language
  Future<String> _getCurrentLanguageCode() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final languageName = prefs.getString('selectedLanguage') ?? 'English';
      
      // Map language names to codes for API
      final Map<String, String> languageMap = {
        'English': 'en',
        'Spanish': 'es',
        'French': 'fr',
        'German': 'de',
        'Hindi': 'hi',
        'Chinese': 'zh',
        'Arabic': 'ar',
        'Bengali': 'bn',
        'Portuguese': 'pt',
        'Russian': 'ru',
      };
      
      return languageMap[languageName] ?? 'en';
    } catch (e) {
      print('Error getting language: $e');
      return 'en'; // Default to English
    }
  }

  // Get all images with single API call
  Future<void> initializeAllImages({bool forceRefresh = false}) async {
    if (_isInitialized && !forceRefresh) return;
    if (_isLoading) return;

    _isLoading = true;

    try {
      // Initialize secure directories first
      await _initializeSecureDirectories();

      // Try to load from secure JSON cache first
      if (!forceRefresh) {
        final cachedImages = await _loadImagesFromSecureCache();
        if (cachedImages.isNotEmpty) {
          _allImages = cachedImages;
          await _loadLocalImagePaths();
          _isInitialized = true;
          _isLoading = false;
          // Still try to preload missing images in background
          _preloadAllImages().catchError((e) => print('Background preload error: $e'));
          return;
        }
      }

      // Fetch all Presentation 1 images in a single request with retry logic
      const maxRetries = 3;
      http.Response? response;
      
      // Get current user's language
      final currentLanguage = await _getCurrentLanguageCode();
      
      for (int attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          response = await http.get(
            Uri.parse('${Constants.baseUrl}/images?language=$currentLanguage'),
            headers: {
              'Accept': 'application/json',
              'Connection': 'keep-alive',
            },
          ).timeout(const Duration(seconds: 30));
          
          if (response.statusCode == 200) {
            break; // Success, exit retry loop
          } else {
            throw Exception('HTTP ${response.statusCode}');
          }
        } catch (e) {
          print('API attempt $attempt failed: $e');
          if (attempt == maxRetries) {
            rethrow; // Last attempt failed, throw the error
          }
          // Wait before retry
          await Future.delayed(Duration(seconds: attempt * 2));
        }
      }

      if (response != null && response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        
        // Filter only Presentation 1 categories and sort
        _allImages = List<Map<String, dynamic>>.from(data)
            .where((image) => 
                image['category'] != null && 
                presentation1Categories.contains(image['category']))
            .toList();

        // Sort by category first, then by position
        _allImages.sort((a, b) {
          final categoryComparison = (a['category'] ?? '').compareTo(b['category'] ?? '');
          if (categoryComparison != 0) return categoryComparison;
          return (a['position'] ?? double.infinity).compareTo(b['position'] ?? double.infinity);
        });

        await _saveImagesToSecureCache();
        await _preloadAllImages();
        _isInitialized = true;
      } else {
        throw Exception('Failed to load images: ${response?.statusCode ?? "No response"}');
      }
    } catch (e) {
      print('Error in initializeAllImages: $e');
      // Try to load from secure cache as fallback
      final cachedImages = await _loadImagesFromSecureCache();
      if (cachedImages.isNotEmpty) {
        _allImages = cachedImages;
        await _loadLocalImagePaths();
        _isInitialized = true;
        print('Loaded ${_allImages.length} images from secure cache as fallback');
      } else {
        rethrow;
      }
    } finally {
      _isLoading = false;
    }
  }

  // Get images for a specific category (client-side filtering)
  List<Map<String, dynamic>> getImagesByCategory(String category) {
    return _allImages
        .where((image) => image['category'] == category)
        .toList();
  }

  // Get all cached images
  List<Map<String, dynamic>> getAllImages() {
    return List.from(_allImages);
  }

  // Get local image path if available
  String? getLocalImagePath(String imageUrl) {
    return _localImagePaths[imageUrl];
  }

  // Retry downloading a specific image to secure storage
  Future<bool> retryImageDownload(String imageUrl) async {
    try {
      if (_secureImagesDir == null) await _initializeSecureDirectories();
      
      final secureFileName = _generateSecureFileName(imageUrl);
      final file = File('${_secureImagesDir!.path}/$secureFileName');
      
      final response = await http.get(
        Uri.parse(imageUrl),
        headers: {
          'Connection': 'keep-alive',
          'Accept': 'image/*',
        },
      ).timeout(const Duration(seconds: 30));
      
      if (response.statusCode == 200) {
        await file.writeAsBytes(response.bodyBytes);
        _localImagePaths[imageUrl] = file.path;
        print('Retry successful for: $imageUrl');
        return true;
      }
    } catch (e) {
      print('Retry download failed for $imageUrl: $e');
    }
    return false;
  }

  // Check if service is initialized
  bool get isInitialized => _isInitialized;

  // Check if service is loading
  bool get isLoading => _isLoading;

  // Save all images to secure JSON cache
  Future<void> _saveImagesToSecureCache() async {
    try {
      if (_secureJsonDir == null) await _initializeSecureDirectories();
      
      final jsonFile = File('${_secureJsonDir!.path}/presentation1_data.json');
      final cacheData = {
        'images': _allImages,
        'timestamp': DateTime.now().toIso8601String(),
        'version': '1.0',
      };
      
      await jsonFile.writeAsString(json.encode(cacheData));
      print('Saved ${_allImages.length} images to secure JSON cache');
    } catch (e) {
      print('Error saving to secure cache: $e');
    }
  }

  // Load images from secure JSON cache
  Future<List<Map<String, dynamic>>> _loadImagesFromSecureCache() async {
    try {
      if (_secureJsonDir == null) await _initializeSecureDirectories();
      
      final jsonFile = File('${_secureJsonDir!.path}/presentation1_data.json');
      if (!await jsonFile.exists()) return [];

      final jsonString = await jsonFile.readAsString();
      final cacheData = json.decode(jsonString) as Map<String, dynamic>;
      
      // Check cache age (optional: refresh after 78 hours)
      final timestampStr = cacheData['timestamp'] as String?;
      if (timestampStr != null) {
        final timestamp = DateTime.parse(timestampStr);
        final hoursSinceCache = DateTime.now().difference(timestamp).inHours;
        
        // If cache is older than 78 hours, return empty to force refresh
        if (hoursSinceCache > 78) {
          print('Cache is ${hoursSinceCache}h old, forcing refresh');
          return [];
        }
      }

      final images = cacheData['images'] as List<dynamic>? ?? [];
      print('Loaded ${images.length} images from secure JSON cache');
      return List<Map<String, dynamic>>.from(images);
    } catch (e) {
      print('Error loading from secure cache: $e');
      return [];
    }
  }

  // Load local image paths from secure directory
  Future<void> _loadLocalImagePaths() async {
    try {
      if (_secureImagesDir == null) await _initializeSecureDirectories();
      
      _localImagePaths.clear();
      
      // Scan secure images directory for existing files
      await for (final entity in _secureImagesDir!.list()) {
        if (entity is File) {
          final fileName = entity.uri.pathSegments.last;
          
          // Find the original URL by checking all images
          for (final image in _allImages) {
            final originalUrl = image['imageUrl'] as String?;
            if (originalUrl != null) {
              final expectedFileName = _generateSecureFileName(originalUrl);
              if (fileName == expectedFileName) {
                _localImagePaths[originalUrl] = entity.path;
                break;
              }
            }
          }
        }
      }
      
      print('Loaded ${_localImagePaths.length} local image paths');
    } catch (e) {
      print('Error loading local image paths: $e');
    }
  }

  // Preload all images to secure local storage
  Future<void> _preloadAllImages() async {
    if (_secureImagesDir == null) await _initializeSecureDirectories();
    
    // Process images in smaller batches to avoid overwhelming the network
    const batchSize = 5;
    for (int i = 0; i < _allImages.length; i += batchSize) {
      final batch = _allImages.skip(i).take(batchSize);
      
      await Future.wait(
        batch.map((image) async {
          if (image['imageUrl'] != null && image['imageUrl'].isNotEmpty) {
            final originalUrl = image['imageUrl'] as String;
            final secureFileName = _generateSecureFileName(originalUrl);
            final file = File('${_secureImagesDir!.path}/$secureFileName');
            
            if (await file.exists()) {
              _localImagePaths[originalUrl] = file.path;
              print('Image already cached: ${image['title']}');
            } else {
              try {
                final response = await http.get(
                  Uri.parse(originalUrl),
                  headers: {
                    'Connection': 'keep-alive',
                    'Accept': 'image/*',
                  },
                ).timeout(const Duration(seconds: 30));
                
                if (response.statusCode == 200) {
                  await file.writeAsBytes(response.bodyBytes);
                  _localImagePaths[originalUrl] = file.path;
                  print('Successfully downloaded to secure storage: ${image['title']}');
                } else {
                  print('Failed to download image: ${image['title']} (${response.statusCode})');
                }
              } catch (e) {
                print('Error downloading image ${image['title']}: $e');
                // Continue with other images even if one fails
              }
            }
          }
        }),
      );
      
      // Small delay between batches to avoid overwhelming the server
      if (i + batchSize < _allImages.length) {
        await Future.delayed(const Duration(milliseconds: 500));
      }
    }
    
    print('Preload complete. ${_localImagePaths.length}/${_allImages.length} images cached securely.');
  }

  // Clear secure cache
  Future<void> clearCache() async {
    try {
      if (_secureJsonDir == null || _secureImagesDir == null) {
        await _initializeSecureDirectories();
      }

      // Clear JSON cache
      final jsonFile = File('${_secureJsonDir!.path}/presentation1_data.json');
      if (await jsonFile.exists()) {
        await jsonFile.delete();
        print('Deleted secure JSON cache');
      }

      // Clear image files from secure directory
      await for (final entity in _secureImagesDir!.list()) {
        if (entity is File) {
          try {
            await entity.delete();
            print('Deleted secure image: ${entity.path.split('/').last}');
          } catch (e) {
            print('Error deleting file: $e');
          }
        }
      }

      // Clear legacy SharedPreferences cache (for backward compatibility)
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('cached_all_presentation1_images');
      await prefs.remove('cached_images_timestamp');

      _allImages.clear();
      _localImagePaths.clear();
      _isInitialized = false;
      
      print('All secure cache cleared successfully');
    } catch (e) {
      print('Error clearing secure cache: $e');
    }
  }

  // Get category statistics
  Map<String, int> getCategoryStats() {
    final stats = <String, int>{};
    for (final image in _allImages) {
      final category = image['category'] as String?;
      if (category != null) {
        stats[category] = (stats[category] ?? 0) + 1;
      }
    }
    return stats;
  }

  // Search images across all categories
  List<Map<String, dynamic>> searchImages(String query) {
    final lowercaseQuery = query.toLowerCase();
    return _allImages.where((image) {
      final title = (image['title'] as String? ?? '').toLowerCase();
      final description = (image['description'] as String? ?? '').toLowerCase();
      final name = (image['name'] as String? ?? '').toLowerCase();
      
      return title.contains(lowercaseQuery) || 
             description.contains(lowercaseQuery) || 
             name.contains(lowercaseQuery);
    }).toList();
  }

  // Get secure storage information
  Future<Map<String, dynamic>> getStorageInfo() async {
    try {
      if (_secureJsonDir == null || _secureImagesDir == null) {
        await _initializeSecureDirectories();
      }

      // Check JSON cache
      final jsonFile = File('${_secureJsonDir!.path}/presentation1_data.json');
      final jsonExists = await jsonFile.exists();
      final jsonSize = jsonExists ? await jsonFile.length() : 0;

      // Count and size of image files
      int imageCount = 0;
      int totalImageSize = 0;
      
      await for (final entity in _secureImagesDir!.list()) {
        if (entity is File) {
          imageCount++;
          totalImageSize += await entity.length();
        }
      }

      return {
        'jsonCacheExists': jsonExists,
        'jsonCacheSize': jsonSize,
        'jsonCachePath': _secureJsonDir!.path,
        'imagesCachedCount': imageCount,
        'totalImagesSize': totalImageSize,
        'imagesCachePath': _secureImagesDir!.path,
        'totalLocalPaths': _localImagePaths.length,
        'isInitialized': _isInitialized,
        'totalImagesLoaded': _allImages.length,
      };
    } catch (e) {
      return {'error': e.toString()};
    }
  }

  // Format bytes to human readable
  String formatBytes(int bytes) {
    if (bytes <= 0) return "0 B";
    const suffixes = ["B", "KB", "MB", "GB"];
    final i = (math.log(bytes) / math.log(1024)).floor();
    return ((bytes / math.pow(1024, i)).toStringAsFixed(1)) + ' ' + suffixes[i];
  }
}