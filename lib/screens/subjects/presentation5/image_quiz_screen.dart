import 'dart:math';
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import '../../../services/tts_service.dart';
import '../../../services/quiz_image_service.dart';

class Find_the_Item extends StatefulWidget {
  const Find_the_Item({Key? key}) : super(key: key);

  @override
  State<Find_the_Item> createState() => _Find_the_ItemState();
}

class _Find_the_ItemState extends State<Find_the_Item>
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
  int consecutiveCorrectAnswers = 0;
  bool showBigCelebration = false;

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
      showBigCelebration = false;
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
      setState(() {
        consecutiveCorrectAnswers++;
        if (consecutiveCorrectAnswers >= 5) {
          showBigCelebration = true;
          consecutiveCorrectAnswers = 0; // Reset after big celebration
        } else {
          showCelebration = true;
        }
      });
      await _ttsService.speak('That is a ${image.name}!');
      if (showBigCelebration) {
        await _ttsService.speak('Amazing! You got 5 correct answers in a row!');
      }
    } else {
      setState(() => consecutiveCorrectAnswers = 0);
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
                        mainAxisSpacing: 32,
                        crossAxisSpacing: 32,
                        childAspectRatio: 0.85,
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
                                    color: const Color(0xFFE3F6F5),
                                    borderRadius: BorderRadius.circular(24),
                                    border: Border.all(
                                      color:
                                          isSelected
                                              ? (isCorrect == true
                                                  ? Colors.green
                                                  : Colors.red)
                                              : const Color(0xFFBEE9E8),
                                      width: 4,
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.05),
                                        blurRadius: 4,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                  child: Stack(
                                    children: [
                                      Column(
                                        children: [
                                          const SizedBox(height: 18),
                                          Expanded(
                                            flex: 4,
                                            child: Center(
                                              child: ClipRRect(
                                                borderRadius:
                                                    BorderRadius.circular(16),
                                                child: Image.network(
                                                  image.imageUrl,
                                                  fit: BoxFit.contain,
                                                  width: 110,
                                                  height: 110,
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
                                          // Removed animal name below image for a cleaner look
                                          const SizedBox(height: 22),
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
                    if (showCelebration || showBigCelebration)
                      Center(
                        child: Stack(
                          children: [
                            if (showBigCelebration) ...[
                              Lottie.asset(
                                'assets/animations/Animation - 1749309499190.json', // Special animation for 5 correct answers
                                controller: _celebrationController,
                                onLoaded: (composition) {
                                  _celebrationController.duration =
                                      composition.duration;
                                  _celebrationController.forward();
                                },
                                fit: BoxFit.cover,
                              ),
                              Center(
                                child: Text(
                                  '🌟 Amazing! 🌟\n5 in a row!',
                                  style: TextStyle(
                                    fontSize: 36,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                    shadows: [
                                      Shadow(
                                        offset: Offset(2, 2),
                                        blurRadius: 3,
                                        color: Colors.black.withOpacity(0.5),
                                      ),
                                    ],
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ] else
                              Lottie.asset(
                                'assets/animations/confetti_single.json',
                                controller: _celebrationController,
                                onLoaded: (composition) {
                                  _celebrationController.duration =
                                      composition.duration;
                                  _celebrationController.forward();
                                },
                                fit: BoxFit.cover,
                              ),
                          ],
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
