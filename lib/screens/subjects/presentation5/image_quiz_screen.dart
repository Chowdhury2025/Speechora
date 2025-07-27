import 'dart:math';
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import '../../../services/tts_service.dart';
import '../../../services/quiz_image_service.dart';

class ImageQuizScreen extends StatefulWidget {
  const ImageQuizScreen({Key? key}) : super(key: key);

  @override
  State<ImageQuizScreen> createState() => _ImageQuizScreenState();
}

class _ImageQuizScreenState extends State<ImageQuizScreen>
    with SingleTickerProviderStateMixin {
  final TTSService _ttsService = TTSService();
  final QuizImageService _quizImageService = QuizImageService();
  final Random random = Random();

  // quiz state
  List<QuizImage> displayedImages = [];
  QuizImage? correctImage;
  QuizImage? selectedImage;
  bool? isCorrect;
  bool isLoading = true;

  // celebration state
  late final AnimationController _celebrationController;
  bool showCelebration = false;

  @override
  void initState() {
    super.initState();
    _celebrationController = AnimationController(vsync: this);
    _setupNewRound();
  }

  Future<void> _setupNewRound() async {
    setState(() {
      isLoading = true;
      isCorrect = null;
      selectedImage = null;
      showCelebration = false;
    });

    try {
      final images = await _quizImageService.getQuizImages(
        quizType: 'image_quiz',
      );

      if (images.isEmpty) {
        throw Exception('No quiz images available');
      }

      final shuffled = List<QuizImage>.from(images)..shuffle(random);
      displayedImages = shuffled.take(6).toList();
      correctImage = displayedImages[random.nextInt(6)];

      _speakWord();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load quiz images: ${e.toString()}')),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> _speakWord() async {
    if (correctImage != null) {
      await _ttsService.speak("Can you find the ${correctImage!.name}?");
    }
  }

  Future<void> _handleImageTap(QuizImage image) async {
    if (selectedImage != null) return;

    setState(() {
      selectedImage = image;
      isCorrect = image.id == correctImage?.id;
    });

    if (isCorrect == true) {
      // show celebration overlay
      setState(() => showCelebration = true);
      await _ttsService.speak('That is a ${image.name}!');
    } else {
      await _ttsService.speak('That is not a ${correctImage!.name}.');
    }

    // wait for both speech and celebration animation
    await Future.delayed(const Duration(seconds: 2));
    _celebrationController.reset();

    _setupNewRound();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFBEE9E8),
      body:
          isLoading
              ? const Center(child: CircularProgressIndicator())
              : SafeArea(
                child: Stack(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: GridView.count(
                        crossAxisCount: 2,
                        mainAxisSpacing: 16,
                        crossAxisSpacing: 16,
                        childAspectRatio: 0.8,
                        children:
                            displayedImages.map((image) {
                              final isSelected = selectedImage?.id == image.id;
                              final showFeedback =
                                  isSelected && isCorrect != null;

                              return GestureDetector(
                                onTap: () => _handleImageTap(image),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 300),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(
                                      color:
                                          isSelected
                                              ? (isCorrect == true
                                                  ? Colors.green
                                                  : Colors.red)
                                              : Colors.grey.shade300,
                                      width: 3,
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.1),
                                        blurRadius: 8,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: Stack(
                                    children: [
                                      Column(
                                        children: [
                                          Expanded(
                                            flex: 3,
                                            child: Container(
                                              width: double.infinity,
                                              padding: const EdgeInsets.all(12),
                                              child: ClipRRect(
                                                borderRadius:
                                                    BorderRadius.circular(12),
                                                child: Image.network(
                                                  image.imageUrl,
                                                  fit: BoxFit.cover,
                                                  width: double.infinity,
                                                  height: double.infinity,
                                                  errorBuilder:
                                                      (
                                                        context,
                                                        error,
                                                        stackTrace,
                                                      ) => Container(
                                                        color:
                                                            Colors
                                                                .grey
                                                                .shade200,
                                                        child: const Icon(
                                                          Icons
                                                              .image_not_supported,
                                                          size: 40,
                                                          color: Colors.grey,
                                                        ),
                                                      ),
                                                ),
                                              ),
                                            ),
                                          ),
                                          Expanded(
                                            flex: 1,
                                            child: Container(
                                              width: double.infinity,
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 8,
                                                  ),
                                              child: Center(
                                                child: Text(
                                                  image.name,
                                                  style: const TextStyle(
                                                    fontSize: 18,
                                                    fontWeight: FontWeight.bold,
                                                    color: Color(0xFF223A5E),
                                                  ),
                                                  textAlign: TextAlign.center,
                                                  maxLines: 2,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      if (showFeedback)
                                        Container(
                                          decoration: BoxDecoration(
                                            color: Colors.black.withOpacity(
                                              0.7,
                                            ),
                                            borderRadius: BorderRadius.circular(
                                              20,
                                            ),
                                          ),
                                          child: Center(
                                            child: Text(
                                              isCorrect == true ? '😃' : '😢',
                                              style: const TextStyle(
                                                fontSize: 80,
                                              ),
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                              );
                            }).toList(),
                      ),
                    ),

                    // Celebration overlay
                    if (showCelebration)
                      Center(
                        child: Lottie.asset(
                          'assets/animations/confetti_single.json',
                          controller: _celebrationController,
                          onLoaded: (composition) {
                            _celebrationController.duration =
                                composition.duration;
                            _celebrationController.forward();
                          },
                          fit: BoxFit.cover,
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
    _celebrationController.dispose();
    super.dispose();
  }
}
