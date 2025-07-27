import 'package:book8/services/tts_service.dart';
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

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
      }
      _hasStartedReading = true;
      // Use Future.microtask to ensure we're fully mounted before starting
      Future.microtask(() => _startReading());
    }
  }

  Future<void> _startReading() async {
    try {
      // Read the current image title
      final String title = widget.image['title'] ?? 'Untitled';
      await ttsService.speakAndWait(title);

      // Pause after title
      await Future.delayed(const Duration(seconds: 1));

      // Read the description
      final String description =
          widget.image['description'] ?? 'No description available';
      await ttsService.speakAndWait(description);

      // Wait 3 seconds after content is fully read
      await Future.delayed(const Duration(seconds: 3));

      // Check if we're at the last image
      if (imagesList != null &&
          currentIndex != null &&
          currentIndex == imagesList!.length - 1) {
        // Show success animation
        setState(() => showSuccess = true);
        await Future.delayed(const Duration(seconds: 5));
        setState(() => showSuccess = false);
        Navigator.of(context).pop(); // Return to grid after completion
      } else if (imagesList != null && currentIndex != null) {
        // Go to next image automatically
        if (!mounted) return; // Check if widget is still mounted

        // Ensure TTS is stopped before navigation
        await ttsService.stop();

        // Create next screen data
        final nextIndex = currentIndex! + 1;
        final nextImage = imagesList![nextIndex];

        if (mounted) {
          // Check again before navigation
          await Navigator.pushReplacement(
            context,
            PageRouteBuilder(
              pageBuilder:
                  (context, animation1, animation2) =>
                      ImageDetailScreen(image: nextImage),
              settings: RouteSettings(
                arguments: {
                  'imagesList': imagesList,
                  'currentIndex': nextIndex,
                },
              ),
              transitionDuration: Duration.zero,
              reverseTransitionDuration: Duration.zero,
            ),
          );
        }
      }
    } catch (e) {
      print('Error in _startReading: $e');
      // Handle any errors gracefully
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error playing content: $e')));
      }
    }
  }

  @override
  void dispose() {
    ttsService.stop();
    _successController.dispose();
    super.dispose();
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
      ),
      body: Stack(
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
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black12,
                            blurRadius: 8,
                            offset: Offset(0, 4),
                          ),
                        ],
                      ),
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                      padding: const EdgeInsets.all(8),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child:
                            widget.preloadedImage != null
                                ? Image(
                                  image: widget.preloadedImage!,
                                  fit: BoxFit.cover,
                                  width:
                                      MediaQuery.of(context).size.width * 0.8,
                                  height: 240,
                                )
                                : (widget.image['imageUrl'] != null &&
                                    widget.image['imageUrl']
                                        .toString()
                                        .isNotEmpty)
                                ? Image.network(
                                  widget.image['imageUrl'],
                                  fit: BoxFit.cover,
                                  width:
                                      MediaQuery.of(context).size.width * 0.8,
                                  height: 240,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      width:
                                          MediaQuery.of(context).size.width *
                                          0.8,
                                      height: 240,
                                      color: Colors.grey[300],
                                      child: const Icon(
                                        Icons.broken_image,
                                        size: 64,
                                        color: Colors.grey,
                                      ),
                                    );
                                  },
                                )
                                : Container(
                                  width:
                                      MediaQuery.of(context).size.width * 0.8,
                                  height: 240,
                                  color: Colors.grey[300],
                                  child: const Icon(
                                    Icons.image_not_supported,
                                    size: 64,
                                    color: Colors.grey,
                                  ),
                                ),
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
                          widget.image['description'] ??
                              'No description available',
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
                              _successController.duration =
                                  composition.duration;
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
    );
  }
}
