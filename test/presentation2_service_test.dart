import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:speachora/services/presentation2_service.dart';

void main() {
  group('Presentation2Service Tests', () {
    late Presentation2Service service;

    setUp(() async {
      // Mock SharedPreferences for testing
      SharedPreferences.setMockInitialValues({});
      service = await Presentation2Service.instance;
    });

    test('should cache lessons correctly', () async {

      // Cache the lessons by using the public interface
      await service.getLessonsBySubject('test_subject'); // This will cache empty result from API
      
      // Mock API response for the refresh call
      // TODO: Add proper API mocking
      
      // Refresh to store the mock lessons
      await service.refreshLessons('test_subject');
      
      // Retrieve lessons (should come from cache)
      final cachedLessons = await service.getLessonsBySubject('test_subject');

      // Verify
      expect(cachedLessons.length, equals(2));
      expect(cachedLessons[0].title, equals('Test Lesson 1'));
      expect(cachedLessons[1].title, equals('Test Lesson 2'));
    });

    test('should check cache freshness correctly', () async {
      const subject = 'test_subject';
      
      // Initially, no cache should exist
      final hasCache1 = await service.hasFreshCache(subject);
      expect(hasCache1, isFalse);

      // Fetch lessons to create cache
      await service.getLessonsBySubject(subject);
      
      // Now should have fresh cache
      final hasCache2 = await service.hasFreshCache(subject);
      expect(hasCache2, isTrue);

      // Check cache age
      final cacheAge = await service.getCacheAgeInDays(subject);
      expect(cacheAge, equals(0)); // Should be 0 days old
    });

    test('should clear cache correctly', () async {
      const subject = 'test_subject';
      
      // Set up some cached data by fetching lessons
      await service.getLessonsBySubject(subject);
      
      // Verify cache exists
      expect(await service.hasFreshCache(subject), isTrue);
      
      // Clear cache
      await service.clearCache(subject);
      
      // Verify cache is cleared
      expect(await service.hasFreshCache(subject), isFalse);
      final cacheAge = await service.getCacheAgeInDays(subject);
      expect(cacheAge, isNull);
    });
  });
}