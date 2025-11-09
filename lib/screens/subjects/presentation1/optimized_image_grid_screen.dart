import 'package:flutter/material.dart';
import 'dart:io';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../services/tts_service.dart';
import '../../../services/presentation1_service.dart';
import 'image_detail_screen.dart';

class OptimizedImageGridScreen extends StatefulWidget {
  final String title;
  final String imageCategory;
  final Color backgroundColor;

  const OptimizedImageGridScreen({
    super.key,
    required this.title,
    required this.imageCategory,
    required this.backgroundColor,
  });

  @override
  State<OptimizedImageGridScreen> createState() =>
      _OptimizedImageGridScreenState();
}

class _OptimizedImageGridScreenState extends State<OptimizedImageGridScreen> {
  final TTSService _ttsService = TTSService();
  final Presentation1Service _imageService = Presentation1Service();
  
  List<Map<String, dynamic>> images = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeImages();
    });
    _ttsService.init();

    // Listen for language changes
    SharedPreferences.getInstance().then((prefs) {
      final currentLang = prefs.getString('selectedLanguage');
      prefs.setString('lastPresentationLanguage', currentLang ?? 'English');
    });
  }

  Future<void> _initializeImages() async {
    setState(() {
      isLoading = true;
      error = null;
    });

    try {
      // Initialize the service with all images (single API call)
      await _imageService.initializeAllImages();
      
      // Filter images for this specific category
      final categoryImages = _imageService.getImagesByCategory(widget.imageCategory);
      
      if (mounted) {
        setState(() {
          images = categoryImages;
          isLoading = false;
        });
      }
    } catch (e) {
      print('Error initializing images for ${widget.imageCategory}: $e');
      if (mounted) {
        setState(() {
          error = 'Failed to load images. Please check your internet connection and try again.';
          isLoading = false;
        });
      }
    }
  }

  Future<void> _refreshImages() async {
    try {
      // Force refresh from API
      await _imageService.initializeAllImages(forceRefresh: true);
      
      // Update local images
      final categoryImages = _imageService.getImagesByCategory(widget.imageCategory);
      
      if (mounted) {
        setState(() {
          images = categoryImages;
          error = null;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          error = e.toString();
        });
      }
    }
  }

  Future<void> speakText(String text, {int? index}) async {
    await _ttsService.speak(text);
  }

  void _showFullScreenImage(
    BuildContext context,
    Map<String, dynamic> image,
    int index,
  ) {
    // Get local image paths from the service
    final localImagePaths = <String, String>{};
    for (final img in images) {
      final localPath = _imageService.getLocalImagePath(img['imageUrl']);
      if (localPath != null) {
        localImagePaths[img['imageUrl']] = localPath;
      }
    }

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => ImageDetailScreen(image: image),
        settings: RouteSettings(
          arguments: {
            'imagesList': images,
            'currentIndex': index,
            'localImagePaths': localImagePaths,
          },
        ),
      ),
    );
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _checkLanguageChange();
  }

  Future<void> _checkLanguageChange() async {
    final prefs = await SharedPreferences.getInstance();
    final lastLang = prefs.getString('lastPresentationLanguage') ?? 'English';
    final currentLang = prefs.getString('selectedLanguage') ?? 'English';
    
    if (lastLang != currentLang) {
      print('Language changed from $lastLang to $currentLang, refreshing content...');
      await prefs.setString('lastPresentationLanguage', currentLang);
      await _imageService.onLanguageChanged();
      if (mounted) {
        await _initializeImages();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.title,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: widget.backgroundColor,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _refreshImages,
          ),
          // Debug info button
          IconButton(
            icon: const Icon(Icons.info, color: Colors.white),
            onPressed: _showDebugInfo,
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              widget.backgroundColor,
              widget.backgroundColor.withOpacity(0.8),
            ],
          ),
        ),
        child: _buildContent(),
      ),
    );
  }

  Widget _buildContent() {
    if (isLoading && !_imageService.isInitialized) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: Colors.white),
            SizedBox(height: 16),
            Text(
              'Loading all images (one-time download)...',
              style: TextStyle(color: Colors.white, fontSize: 16),
            ),
            SizedBox(height: 8),
            Text(
              'This improves performance for all categories',
              style: TextStyle(color: Colors.white70, fontSize: 12),
            ),
          ],
        ),
      );
    }

    if (error != null && images.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, color: Colors.white, size: 64),
            const SizedBox(height: 16),
            Text(
              'Error loading images',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error!,
              style: const TextStyle(color: Colors.white70, fontSize: 14),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _refreshImages,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: widget.backgroundColor,
              ),
              child: const Text('Try Again'),
            ),
          ],
        ),
      );
    }

    if (images.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.image_not_supported, color: Colors.white, size: 64),
            const SizedBox(height: 16),
            Text(
              'No images available for ${widget.title}',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Check back later for new content',
              style: TextStyle(color: Colors.white70, fontSize: 14),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _refreshImages,
      child: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 1,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemCount: images.length,
        itemBuilder: (context, index) {
          final image = images[index];
          return GestureDetector(
            onTap: () => _showFullScreenImage(context, image, index),
            child: Card(
              elevation: 8,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    _buildImageWidget(image),
                    _buildImageOverlay(image),
                    if (_imageService.isLoading)
                      Container(
                        color: Colors.black.withOpacity(0.3),
                        child: const Center(
                          child: CircularProgressIndicator(color: Colors.white),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildImageWidget(Map<String, dynamic> image) {
    final localPath = _imageService.getLocalImagePath(image['imageUrl']);
    
    if (localPath != null && File(localPath).existsSync()) {
      return Image.file(
        File(localPath),
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => _buildErrorWidget(),
      );
    } else {
      return CachedNetworkImage(
        imageUrl: image['imageUrl'],
        fit: BoxFit.cover,
        placeholder: (context, url) => Container(
          color: Colors.grey.shade200,
          child: const Center(
            child: CircularProgressIndicator(),
          ),
        ),
        errorWidget: (context, url, error) => _buildErrorWidget(),
      );
    }
  }

  Widget _buildErrorWidget() {
    return Container(
      color: Colors.grey.shade300,
      child: const Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.broken_image, size: 32, color: Colors.grey),
          SizedBox(height: 8),
          Text(
            'Image not available',
            style: TextStyle(color: Colors.grey, fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _buildImageOverlay(Map<String, dynamic> image) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.bottomCenter,
            end: Alignment.topCenter,
            colors: [
              Colors.black.withOpacity(0.8),
              Colors.black.withOpacity(0.4),
              Colors.transparent,
            ],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              image['title'] ?? 'Untitled',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            if (image['description'] != null &&
                image['description'].toString().isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  image['description'],
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _showDebugInfo() async {
    final stats = _imageService.getCategoryStats();
    
    // Get current language
    final prefs = await SharedPreferences.getInstance();
    final currentLanguage = prefs.getString('selectedLanguage') ?? 'English';
    
    if (mounted) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Debug Info'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Current Language: $currentLanguage'),
              Text('Total Images Loaded: ${_imageService.getAllImages().length}'),
              Text('Current Category: ${widget.imageCategory}'),
              Text('Current Category Count: ${images.length}'),
              const SizedBox(height: 16),
              const Text('Category Statistics:', style: TextStyle(fontWeight: FontWeight.bold)),
              ...stats.entries.map((e) => Text('${e.key}: ${e.value}')),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close'),
            ),
          ],
        ),
      );
    }
  }

  @override
  void dispose() {
    _ttsService.stop();
    super.dispose();
  }
}