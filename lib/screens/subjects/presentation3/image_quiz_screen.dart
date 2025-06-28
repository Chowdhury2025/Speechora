import 'dart:math';
import 'package:flutter/material.dart';
import '../../../services/tts_service.dart';
import '../../../services/quiz_image_service.dart';

class ImageQuizScreen extends StatefulWidget {
  const ImageQuizScreen({Key? key, required String title}) : super(key: key);

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
  QuizImage? selectedImage;

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
          images
              .where((image) => image.quizTypes.contains('image_quiz'))
              .toList();

      if (imageQuizImages.isEmpty) {
        throw Exception('No quiz images available');
      } // Shuffle all images and take first 6
      final shuffledImages = List<QuizImage>.from(imageQuizImages)
        ..shuffle(random);
      displayedImages = shuffledImages.take(6).toList();
      // Pick one random image from the 6 as correct answer
      correctImage = displayedImages[random.nextInt(displayedImages.length)];
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
      await _ttsService.speak("Can you find the ss ${correctImage!.name}?");
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
      backgroundColor: const Color(0xFFBEE9E8),
      appBar: AppBar(
        backgroundColor: Colors.blue,
        title: const Text('Image Quiz'),
        elevation: 0,
      ),
      body:
          isLoading
              ? const Center(child: CircularProgressIndicator())
              : SafeArea(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(top: 32.0, bottom: 16.0),
                      child: Text(
                        correctImage != null ? 'Can I play?' : '',
                        style: const TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF223A5E),
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    Expanded(
                      child: GridView.count(
                        crossAxisCount: 2,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 8,
                        ),
                        mainAxisSpacing: 24,
                        crossAxisSpacing: 24,
                        children:
                            displayedImages.map((image) {
                              final isSelected = selectedImage?.id == image.id;
                              final cardColor =
                                  isSelected
                                      ? const Color(0xFFFFF3C7)
                                      : (displayedImages.indexOf(image) % 2 == 0
                                          ? const Color(0xFFFFF3C7)
                                          : const Color(0xFFFFE0B2));
                              return GestureDetector(
                                onTap: () {
                                  setState(() {
                                    selectedImage = image;
                                  });
                                  _ttsService.speak(image.name);
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  decoration: BoxDecoration(
                                    color: cardColor,
                                    borderRadius: BorderRadius.circular(28),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.grey.withOpacity(0.12),
                                        blurRadius: 8,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                    border:
                                        isSelected
                                            ? Border.all(
                                              color: Colors.blue,
                                              width: 3,
                                            )
                                            : null,
                                  ),
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 18,
                                    horizontal: 8,
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Expanded(
                                        child: ClipRRect(
                                          borderRadius: BorderRadius.circular(
                                            18,
                                          ),
                                          child: Image.network(
                                            image.imageUrl,
                                            fit: BoxFit.contain,
                                            errorBuilder:
                                                (context, error, stackTrace) =>
                                                    const Icon(Icons.error),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 10),
                                      Text(
                                        image.name,
                                        style: const TextStyle(
                                          fontSize: 22,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF223A5E),
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            }).toList(),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(
                        bottom: 32.0,
                        left: 16,
                        right: 16,
                        top: 16,
                      ),
                      child: Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF3C7),
                          borderRadius: BorderRadius.circular(24),
                        ),
                        padding: const EdgeInsets.symmetric(
                          vertical: 20,
                          horizontal: 12,
                        ),
                        child: Text(
                          selectedImage != null
                              ? 'I want to play with ${selectedImage!.name}'
                              : 'I want to play with ...',
                          style: const TextStyle(
                            fontSize: 26,
                            color: Color(0xFF223A5E),
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
    );
  }

  @override
  void dispose() {
    _ttsService.stop();
    super.dispose();
  }
}
