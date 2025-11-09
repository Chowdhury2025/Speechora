import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/constants.dart';
import '../models/lesson_models.dart';

class Presentation2Service {
  static Presentation2Service? _instance;
  static Future<Presentation2Service> get instance async {
    _instance ??= Presentation2Service._internal();
    return _instance!;
  }

  Presentation2Service._internal();

  static const String _cacheKeyPrefix = 'presentation2_lessons_';
  static const String _lastUpdateKeyPrefix = 'presentation2_last_update_';
  static const Duration _cacheExpiration = Duration(days: 14); // 2 weeks

  static const Map<String, String> _languageNameToCode = {
    'English': 'en',
    'Spanish': 'es',
    'French': 'fr',
    'German': 'de',
    'Hindi': 'hi',
    'Chinese': 'zh',
    'Arabic': 'ar',
    'Bangla': 'bn',
    'Portuguese': 'pt',
    'Russian': 'ru',
  };

  String _buildCacheKey(String subject, String language) => '$_cacheKeyPrefix${subject}_$language';
  String _buildLastUpdateKey(String subject, String language) => '$_lastUpdateKeyPrefix${subject}_$language';

  Future<String> _getCurrentLanguageCode() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final languageName = prefs.getString('selectedLanguage') ?? 'English';
      return _languageNameToCode[languageName] ?? 'en';
    } catch (_) {
      return 'en';
    }
  }

  /// Get lessons for a specific subject with intelligent caching
  Future<List<Lesson>> getLessonsBySubject(String subject) async {
    try {
      final languageCode = await _getCurrentLanguageCode();
      // Check if we have valid cached data
      final cachedLessons = await _getCachedLessons(subject, languageCode);
      final lastUpdate = await _getLastUpdateTime(subject, languageCode);
      
      // If cache is valid and not expired, return cached data
      if (cachedLessons.isNotEmpty && lastUpdate != null) {
        final timeSinceUpdate = DateTime.now().difference(lastUpdate);
        if (timeSinceUpdate < _cacheExpiration) {
          return cachedLessons;
        }
      }

      // Try to fetch fresh data from API
      final freshLessons = await _fetchLessonsFromAPI(subject, languageCode);
      
      if (freshLessons.isNotEmpty) {
        // Save fresh data to cache
        await Future.wait([
          _cacheLessons(subject, languageCode, freshLessons),
          _updateLastUpdateTime(subject, languageCode)
        ]);
        return freshLessons;
      }

      // API returned empty, use cached data if available
      if (cachedLessons.isNotEmpty) {
        return cachedLessons;
      }

      return [];
    } catch (e) {
      // On error, try to return cached data regardless of age
      final languageCode = await _getCurrentLanguageCode();
      final cachedLessons = await _getCachedLessons(subject, languageCode);
      if (cachedLessons.isNotEmpty) {
        return cachedLessons;
      }
      
      throw Exception('Failed to load lessons: $e');
    }
  }

  /// Force refresh lessons (ignores cache)
  Future<List<Lesson>> refreshLessons(String subject) async {
    try {
      final languageCode = await _getCurrentLanguageCode();
      final freshLessons = await _fetchLessonsFromAPI(subject, languageCode);
      
      if (freshLessons.isNotEmpty) {
        await Future.wait([
          _cacheLessons(subject, languageCode, freshLessons),
          _updateLastUpdateTime(subject, languageCode)
        ]);
      }
      
      return freshLessons;
    } catch (e) {
      // On refresh error, still try to return cached data
      final languageCode = await _getCurrentLanguageCode();
      final cachedLessons = await _getCachedLessons(subject, languageCode);
      if (cachedLessons.isNotEmpty) {
        return cachedLessons;
      }
      throw Exception('Failed to refresh lessons: $e');
    }
  }

  /// Check if cached data exists and is fresh
  Future<bool> hasFreshCache(String subject) async {
    final languageCode = await _getCurrentLanguageCode();
    final lastUpdate = await _getLastUpdateTime(subject, languageCode);
    if (lastUpdate == null) return false;
    
    final timeSinceUpdate = DateTime.now().difference(lastUpdate);
    return timeSinceUpdate < _cacheExpiration;
  }

  /// Get cache age in days
  Future<int?> getCacheAgeInDays(String subject) async {
    final languageCode = await _getCurrentLanguageCode();
    final lastUpdate = await _getLastUpdateTime(subject, languageCode);
    if (lastUpdate == null) return null;
    
    final timeSinceUpdate = DateTime.now().difference(lastUpdate);
    return timeSinceUpdate.inDays;
  }

  /// Clear cache for a specific subject
  Future<void> clearCache(String subject) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final keys = prefs.getKeys();
      final targets = keys.where((key) =>
          key.startsWith('$_cacheKeyPrefix$subject') ||
          key.startsWith('$_lastUpdateKeyPrefix$subject'));  
      await Future.wait(targets.map((key) => prefs.remove(key)));
    } catch (e) {
      // Silent error - cache clearing is not critical
    }
  }

  /// Clear all presentation2 cache
  Future<void> clearAllCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final keys = prefs.getKeys();
      
      await Future.wait(
        keys.where((key) => 
          key.startsWith(_cacheKeyPrefix) || 
          key.startsWith(_lastUpdateKeyPrefix)
        ).map((key) => prefs.remove(key))
      );
    } catch (e) {
      // Silent error - cache clearing is not critical
    }
  }

  // Private methods

  Future<List<Lesson>> _fetchLessonsFromAPI(String subject, String language) async {
    final response = await http.get(
      Uri.parse('${Constants.baseUrl}/lessons/subject/$subject?language=$language'),
      headers: {'Content-Type': 'application/json'},
    ).timeout(const Duration(seconds: 10)); // 10-second timeout

    if (response.statusCode == 200) {
      final Map<String, dynamic> responseData = json.decode(response.body);
      
      if (!responseData.containsKey('lessons')) {
        return [];
      }

      final List<dynamic> data = responseData['lessons'];
      return data.map((item) => Lesson.fromJson(item)).toList();
    }

    throw Exception('Failed to load lessons: ${response.statusCode}');
  }

  Future<void> _cacheLessons(String subject, String language, List<Lesson> lessons) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final lessonsJson = json.encode(lessons.map((lesson) => lesson.toJson()).toList());
      await prefs.setString(_buildCacheKey(subject, language), lessonsJson);
    } catch (e) {
      // Silent error - caching failure should not affect app functionality
    }
  }

  Future<List<Lesson>> _getCachedLessons(String subject, String language) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final lessonsJson = prefs.getString(_buildCacheKey(subject, language));
      
      if (lessonsJson != null) {
        final List<dynamic> data = json.decode(lessonsJson);
        return data.map((item) => Lesson.fromJson(item)).toList();
      }
    } catch (e) {
      // Silent error - cache read failure should not affect app functionality
    }
    return [];
  }

  Future<void> _updateLastUpdateTime(String subject, String language) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        _buildLastUpdateKey(subject, language),
        DateTime.now().toIso8601String(),
      );
    } catch (e) {
      // Silent error - timestamp update failure should not affect app functionality
    }
  }

  Future<DateTime?> _getLastUpdateTime(String subject, String language) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final timeString = prefs.getString(_buildLastUpdateKey(subject, language));
      
      if (timeString != null) {
        return DateTime.parse(timeString);
      }
    } catch (e) {
      // Silent error - timestamp read failure should not affect app functionality
    }
    return null;
  }
}