import 'dart:collection';
import 'package:flutter/material.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import '../models/image_model.dart';

class ImageCacheService {
  static final ImageCacheService _instance = ImageCacheService._internal();
  factory ImageCacheService() => _instance;
  ImageCacheService._internal();

  final _cachedImages = HashMap<String, ImageModel>();
  final _cachedImageFiles = HashMap<String, FileInfo>();

  void cacheImage(ImageModel image) {
    _cachedImages[image.id.toString()] = image;
  }

  void cacheImages(List<ImageModel> images) {
    for (var image in images) {
      cacheImage(image);
    }
  }

  ImageModel? getCachedImage(String id) {
    return _cachedImages[id];
  }

  Future<void> prefetchImage(String imageUrl) async {
    try {
      if (_cachedImageFiles.containsKey(imageUrl)) return;

      final fileInfo = await DefaultCacheManager().downloadFile(imageUrl);
      _cachedImageFiles[imageUrl] = fileInfo;
    } catch (e) {
      debugPrint('Error prefetching image: $e');
    }
  }

  Future<void> prefetchImages(List<String> imageUrls) async {
    await Future.wait(imageUrls.map((url) => prefetchImage(url)));
  }

  Future<FileInfo?> getCachedImageFile(String imageUrl) async {
    if (_cachedImageFiles.containsKey(imageUrl)) {
      return _cachedImageFiles[imageUrl];
    }

    try {
      final fileInfo = await DefaultCacheManager().getFileFromCache(imageUrl);
      if (fileInfo != null) {
        _cachedImageFiles[imageUrl] = fileInfo;
        return fileInfo;
      }
    } catch (e) {
      debugPrint('Error getting cached image: $e');
    }
    return null;
  }

  void clearCache() {
    _cachedImages.clear();
    _cachedImageFiles.clear();
    DefaultCacheManager().emptyCache();
  }
}
