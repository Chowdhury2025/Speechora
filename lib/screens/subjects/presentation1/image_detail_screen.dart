import 'package:speachora/services/tts_service.dart';
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'dart:io';
import 'package:cached_network_image/cached_network_image.dart';

class ImageDetailScreen extends StatefulWidget {
  final Map<String, dynamic> image;
  final ImageProvider? preloadedImage;

  const ImageDetailScreen({Key? key, required this.image, this.preloadedImage})
    : super(key: key);

  @override
  State<ImageDetailScreen> createState() => _ImageDetailScreenState();
}

class _ImageDetailScreenState extends State<ImageDetailScreen>
    with TickerProviderStateMixin {
  final TTSService ttsService = TTSService();
  bool showSuccess = false;
  late AnimationController _successController;
  List<Map<String, dynamic>>? imagesList;
  int? currentIndex;
  Map<String, String>? localImagePaths;

  @override
  void initState() {
    super.initState();
    _successController = AnimationController(vsync: this);
  }

  bool _hasStartedReading = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_hasStartedReading) {
      if (ModalRoute.of(context)?.settings.arguments is Map) {
        final args = ModalRoute.of(context)!.settings.arguments as Map;
        imagesList = args['imagesList'] as List<Map<String, dynamic>>?;
        currentIndex = args['currentIndex'] as int?;
        
        // Handle localImagePaths safely - it might be null from the new optimized screen
        final rawLocalImagePaths = args['localImagePaths'];
        if (rawLocalImagePaths != null && rawLocalImagePaths is Map) {
          localImagePaths = Map<String, String>.from(rawLocalImagePaths);
        } else {
          localImagePaths = <String, String>{};
        }
      }
      _hasStartedReading = true;
    }
  }

  Future<void> _startReading() async {
    try {
      final String title = widget.image['title'] ?? 'Untitled';
      await ttsService.speakAndWait(title);
      await Future.delayed(const Duration(seconds: 1));
      
      final String description = widget.image['description'] ?? 'No description available';
      await ttsService.speakAndWait(description);
      await Future.delayed(const Duration(seconds: 3));

      if (imagesList != null &&
          currentIndex != null &&
          currentIndex == imagesList!.length - 1) {
        setState(() => showSuccess = true);
        await Future.delayed(const Duration(seconds: 5));
        setState(() => showSuccess = false);
        Navigator.of(context).pop();
      } else if (imagesList != null && currentIndex != null) {
        await _navigateToNext();
      }
    } catch (e) {
      print('Error in _startReading: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error playing content: $e'))
        );
      }
    }
  }

  Future<void> _navigateToNext() async {
    if (imagesList == null || currentIndex == null) return;

    final nextIndex = currentIndex! + 1;
    if (nextIndex >= imagesList!.length) return;

    await _navigateToIndex(nextIndex);
  }

  Future<void> _navigateToPrevious() async {
    if (imagesList == null || currentIndex == null) return;

    final prevIndex = currentIndex! - 1;
    if (prevIndex < 0) return;

    await _navigateToIndex(prevIndex);
  }

  Future<void> _navigateToIndex(int targetIndex) async {
    if (!mounted) return;
    await ttsService.stop();

    final targetImage = imagesList![targetIndex];

    if (mounted) {
      await Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation1, animation2) =>
              ImageDetailScreen(image: targetImage),
          settings: RouteSettings(
            arguments: {
              'imagesList': imagesList,
              'currentIndex': targetIndex,
              'localImagePaths': localImagePaths,
            },
          ),
          transitionDuration: Duration.zero,
          reverseTransitionDuration: Duration.zero,
        ),
      );
    }
  }

  void _onHorizontalDrag(DragEndDetails details) {
    if (imagesList == null || currentIndex == null) return;

    if (details.primaryVelocity! > 300) {
      _navigateToPrevious();
    } else if (details.primaryVelocity! < -300) {
      _navigateToNext();
    }
  }

  @override
  void dispose() {
    ttsService.stop();
    _successController.dispose();
    super.dispose();
  }

  Widget _buildImageContent(BuildContext context, BoxConstraints constraints) {
    final maxWidth = constraints.maxWidth;
    final maxHeight = constraints.maxHeight;
    final isTablet = maxWidth > 600;

    return Container(
      width: isTablet ? maxWidth * 0.8 : maxWidth,
      constraints: BoxConstraints(
        maxHeight: maxHeight * 0.6,
        minHeight: 280,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: widget.preloadedImage != null
            ? Image(
                image: widget.preloadedImage!,
                fit: BoxFit.contain,
              )
            : _buildNetworkOrLocalImage(isTablet, maxWidth, maxHeight),
      ),
    );
  }

  Widget _buildNetworkOrLocalImage(bool isTablet, double maxWidth, double maxHeight) {
    if (widget.image['imageUrl'] == null || widget.image['imageUrl'].toString().isEmpty) {
      return _buildErrorContainer(isTablet, maxWidth);
    }

    final localPath = localImagePaths?[widget.image['imageUrl']];
    if (localPath != null && File(localPath).existsSync()) {
      return Image.file(
        File(localPath),
        fit: BoxFit.contain,
        errorBuilder: (context, error, stackTrace) => 
            _buildErrorContainer(isTablet, maxWidth),
      );
    }

    return CachedNetworkImage(
      imageUrl: widget.image['imageUrl'],
      fit: BoxFit.contain,
      placeholder: (context, url) => _buildLoadingContainer(isTablet, maxWidth),
      errorWidget: (context, url, error) => 
          _buildErrorContainer(isTablet, maxWidth),
    );
  }

  Widget _buildErrorContainer(bool isTablet, double maxWidth) {
    return Container(
      width: isTablet ? maxWidth * 0.8 : maxWidth,
      height: 280,
      decoration: BoxDecoration(
        color: Colors.grey[300],
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Center(
        child: Icon(
          Icons.broken_image,
          size: 100,
          color: Colors.grey,
        ),
      ),
    );
  }

  Widget _buildLoadingContainer(bool isTablet, double maxWidth) {
    return Container(
      width: isTablet ? maxWidth * 0.8 : maxWidth,
      height: 280,
      decoration: BoxDecoration(
        color: Colors.grey[300],
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Center(
        child: CircularProgressIndicator(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFB8E4DA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1E4147)),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          if (imagesList != null && currentIndex != null)
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (currentIndex! > 0)
                  Tooltip(
                    message: 'Previous',
                    child: IconButton(
                      onPressed: _navigateToPrevious,
                      icon: const Icon(
                        Icons.chevron_left,
                        color: Color(0xFF1E4147),
                        size: 32,
                      ),
                    ),
                  ),
                if (currentIndex! < (imagesList?.length ?? 0) - 1)
                  Tooltip(
                    message: 'Next',
                    child: IconButton(
                      onPressed: _navigateToNext,
                      icon: const Icon(
                        Icons.chevron_right,
                        color: Color(0xFF1E4147),
                        size: 32,
                      ),
                    ),
                  ),
              ],
            ),
        ],
      ),
      body: GestureDetector(
        onHorizontalDragEnd: _onHorizontalDrag,
        child: Stack(
          children: [
            SafeArea(
              child: Center(
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const SizedBox(height: 16),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        child: Text(
                          widget.image['title'] ?? 'Untitled',
                          style: const TextStyle(
                            fontSize: 44,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1E4147),
                            height: 1.2,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Container(
                        margin: const EdgeInsets.symmetric(horizontal: 12),
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black12,
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Stack(
                          children: [
                            LayoutBuilder(
                              builder: (context, constraints) {
                                return _buildImageContent(context, constraints);
                              },
                            ),
                            Positioned.fill(
                              child: Center(
                                child: Material(
                                  color: Colors.transparent,
                                  child: InkWell(
                                    onTap: _startReading,
                                    customBorder: const CircleBorder(),
                                    child: Container(
                                      padding: const EdgeInsets.all(16),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        child: Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF6D6),
                            borderRadius: BorderRadius.circular(18),
                          ),
                          padding: const EdgeInsets.symmetric(
                            vertical: 18,
                            horizontal: 12,
                          ),
                          child: Text(
                            widget.image['description'] ?? 'No description available',
                            style: const TextStyle(
                              fontSize: 22,
                              color: Color(0xFF1E4147),
                              fontWeight: FontWeight.w600,
                              height: 1.3,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),
            ),
            if (showSuccess)
              Container(
                color: Colors.black.withOpacity(0.7),
                child: Center(
                  child: SizedBox(
                    width: 300,
                    height: 300,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Lottie.asset(
                              'assets/animations/completed_a_task.json',
                              controller: _successController,
                              onLoaded: (composition) {
                                _successController.duration = composition.duration;
                                _successController.forward();
                              },
                              fit: BoxFit.contain,
                            ),
                          ),
                        ),
                        const Text(
                          'Task Completed!',
                          style: TextStyle(
                            fontSize: 32,
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}