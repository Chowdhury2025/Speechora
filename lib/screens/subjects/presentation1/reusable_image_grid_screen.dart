import 'package:book8/constants/constants.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../services/tts_service.dart';
import 'image_detail_screen.dart';

class ReusableImageGridScreen extends StatefulWidget {
  final String title;
  final String imageCategory;
  final Color backgroundColor;

  const ReusableImageGridScreen({
    super.key,
    required this.title,
    required this.imageCategory,
    required this.backgroundColor,
  });

  @override
  State<ReusableImageGridScreen> createState() =>
      _ReusableImageGridScreenState();
}

class _ReusableImageGridScreenState extends State<ReusableImageGridScreen> {
  final TTSService _ttsService = TTSService();
  List<Map<String, dynamic>> images = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchImages();
    _ttsService.init();
  }

  Future<void> fetchImages() async {
    try {
      final response = await http.get(
        Uri.parse(
          '${Constants.baseUrl}/images?category=${widget.imageCategory}',
        ),
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        if (mounted) {
          setState(() {
            images = List<Map<String, dynamic>>.from(data);
            // Sort images by position if available, fallback to id
            images.sort(
              (a, b) => (a['position'] ?? double.infinity).compareTo(
                b['position'] ?? double.infinity,
              ),
            );
            isLoading = false;
          });
        }
      } else {
        throw Exception('Failed to load images: ${response.statusCode}');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          error = e.toString();
          isLoading = false;
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
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => ImageDetailScreen(image: image),
        settings: RouteSettings(
          arguments: {'imagesList': images, 'currentIndex': index},
        ),
      ),
    );
  }

  Future<void> _refreshImages() async {
    setState(() {
      isLoading = true;
      error = null;
    });
    await fetchImages();
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
    if (isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: Colors.white),
            SizedBox(height: 16),
            Text(
              'Loading images...',
              style: TextStyle(color: Colors.white, fontSize: 16),
            ),
          ],
        ),
      );
    }

    if (error != null) {
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
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.image_not_supported, color: Colors.white, size: 64),
            SizedBox(height: 16),
            Text(
              'No images available',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            Text(
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
                    CachedNetworkImage(
                      imageUrl: image['imageUrl'],
                      fit: BoxFit.cover,
                      placeholder:
                          (context, url) => Container(
                            color: Colors.grey.shade200,
                            child: const Center(
                              child: CircularProgressIndicator(),
                            ),
                          ),
                      errorWidget:
                          (context, url, error) => Container(
                            color: Colors.grey.shade300,
                            child: const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.broken_image,
                                  size: 32,
                                  color: Colors.grey,
                                ),
                                SizedBox(height: 8),
                                Text(
                                  'Image not available',
                                  style: TextStyle(
                                    color: Colors.grey,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                    ),
                    Positioned(
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
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.5),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: IconButton(
                          icon: const Icon(
                            Icons.volume_up,
                            color: Colors.white,
                            size: 20,
                          ),
                          onPressed: () {
                            final textToSpeak =
                                '${image['title'] ?? 'Image'}. ${image['description'] ?? ''}';
                            speakText(textToSpeak);
                          },
                        ),
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

  @override
  void dispose() {
    _ttsService.stop();
    super.dispose();
  }
}
