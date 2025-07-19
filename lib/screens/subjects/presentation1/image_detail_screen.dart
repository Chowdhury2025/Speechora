import 'package:book8/services/tts_service.dart';
import 'package:flutter/material.dart';

class ImageDetailScreen extends StatefulWidget {
  final Map<String, dynamic> image;
  final ImageProvider? preloadedImage;

  const ImageDetailScreen({Key? key, required this.image, this.preloadedImage})
    : super(key: key);

  @override
  State<ImageDetailScreen> createState() => _ImageDetailScreenState();
}

class _ImageDetailScreenState extends State<ImageDetailScreen> {
  final TTSService ttsService = TTSService();

  @override
  void initState() {
    super.initState();
    _startReading();
  }

  Future<void> _startReading() async {
    final String title = widget.image['title'] ?? 'Untitled';
    await ttsService.speak(title);
    await Future.delayed(const Duration(milliseconds: 2000));
    final String description =
        widget.image['description'] ?? 'No description available';
    await ttsService.speak(description);
  }

  @override
  void dispose() {
    ttsService.stop();
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
      body: SafeArea(
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
                              width: MediaQuery.of(context).size.width * 0.8,
                              height: 240,
                            )
                            : (widget.image['imageUrl'] != null &&
                                widget.image['imageUrl'].toString().isNotEmpty)
                            ? Image.network(
                              widget.image['imageUrl'],
                              fit: BoxFit.cover,
                              width: MediaQuery.of(context).size.width * 0.8,
                              height: 240,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  width:
                                      MediaQuery.of(context).size.width * 0.8,
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
                              width: MediaQuery.of(context).size.width * 0.8,
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
    );
  }
}
