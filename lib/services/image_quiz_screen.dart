import 'dart:math';
import 'package:flutter/material.dart';
import '../../../services/tts_service.dart';
import '../../../services/quiz_image_service.dart';

class ImageQuizScreen extends StatefulWidget {
  const ImageQuizScreen({Key? key}) : super(key: key);

  @override
  State<ImageQuizScreen> createState() => _ImageQuizScreenState();
}

class _ImageQuizScreenState extends State<ImageQuizScreen> {
  final TTSService _ttsService = TTSService();
  final QuizImageService _quizImageService = QuizImageService();
  final Random random = Random();

  List<QuizImage> displayedImages = [];
  QuizImage? correctImage;
  bool showSuccess = false;
  bool showError = false;
  bool isLoading = true;
  @override
  void initState() {
    super.initState();
    _initTTS();
  }

  Future<void> _initTTS() async {
    await _ttsService.init();
    _setupNewRound();
  }

  Future<void> _setupNewRound() async {
    setState(() {
      isLoading = true;
    });

    try {
      // Fetch quiz images from the API
      final List<QuizImage> images = await _quizImageService.getQuizImages();
      final List<QuizImage> imageQuizImages =
          images.where((image) => image.category == 'image_quiz').toList();

      if (imageQuizImages.isEmpty) {
        throw Exception('No quiz images available');
      }

      // Shuffle all images and take first 6
      final shuffledImages = List<QuizImage>.from(images)..shuffle(random);
      displayedImages = shuffledImages.take(6).toList();
      // Pick one random image from the 6 as correct answer
      correctImage = displayedImages[random.nextInt(6)];
      // Speak the name of the correct image
      _speakWord();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load quiz images: ${e.toString()}')),
      );
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _speakWord() async {
    if (correctImage != null) {
      await _ttsService.speak("Can you find the ${correctImage!.name}?");
    }
  }

  Future<void> _handleImageTap(QuizImage selectedImage) async {
    if (selectedImage.id == correctImage?.id) {
      setState(() {
        showSuccess = true;
        showError = false;
      });

      // Speak success message
      await _ttsService.speak("Correct! That's the ${selectedImage.name}!");

      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          setState(() {
            showSuccess = false;
            _setupNewRound();
          });
        }
      });
    } else {
      setState(() {
        showError = true;
        showSuccess = false;
      });

      // Speak error message
      await _ttsService.speak(
        "Try again! That's not the ${correctImage?.name}",
      );

      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          setState(() {
            showError = false;
          });
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          isLoading
              ? 'Loading...'
              : correctImage != null
              ? 'Find the ${correctImage!.name}!'
              : 'Find the Item! ss',
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.volume_up),
            onPressed: correctImage != null ? _speakWord : null,
            color: correctImage != null ? null : Colors.grey,
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              const SizedBox(height: 20),
              if (isLoading)
                const Expanded(
                  child: Center(child: CircularProgressIndicator()),
                )
              else
                Expanded(
                  child: GridView.count(
                    crossAxisCount: 2,
                    padding: const EdgeInsets.all(16),
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    children:
                        displayedImages.map((image) {
                          return GestureDetector(
                            onTap: () => _handleImageTap(image),
                            child: Container(
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.grey),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.network(
                                  image.imageUrl,
                                  fit: BoxFit.cover,
                                  loadingBuilder: (
                                    context,
                                    child,
                                    loadingProgress,
                                  ) {
                                    if (loadingProgress == null) return child;
                                    return Center(
                                      child: CircularProgressIndicator(
                                        value:
                                            loadingProgress
                                                        .expectedTotalBytes !=
                                                    null
                                                ? loadingProgress
                                                        .cumulativeBytesLoaded /
                                                    loadingProgress
                                                        .expectedTotalBytes!
                                                : null,
                                      ),
                                    );
                                  },
                                  errorBuilder: (context, error, stackTrace) {
                                    return const Center(
                                      child: Icon(Icons.error),
                                    );
                                  },
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                  ),
                ),
            ],
          ),
          if (showSuccess)
            Container(
              color: Colors.green.withOpacity(0.7),
              child: const Center(
                child: Icon(Icons.check_circle, color: Colors.white, size: 100),
              ),
            ),
          if (showError)
            Container(
              color: Colors.red.withOpacity(0.7),
              child: const Center(
                child: Icon(Icons.close, color: Colors.white, size: 100),
              ),
            ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _ttsService.stop();
    super.dispose();
  }
}
