import 'dart:math';
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import '../../../services/tts_service.dart';
import '../../../services/quiz_image_service.dart';

class presentation5 extends StatefulWidget {
  const presentation5({Key? key}) : super(key: key);

  @override
  State<presentation5> createState() => _presentation5State();
}

class _presentation5State extends State<presentation5>
    with SingleTickerProviderStateMixin {
  final TTSService _ttsService = TTSService();
  final QuizImageService _quizImageService = QuizImageService();
  final Random random = Random();

  // Image caching
  List<QuizImage> allQuizImages = [];
  bool imagesPreloaded = false;

  // quiz state
  List<QuizImage> displayedImages = [];
  QuizImage? correctImage;
  QuizImage? selectedImage;
  bool? isCorrect;
  bool isLoading = true;
  bool isTransitioning = false;

  // celebration state
  late final AnimationController _celebrationController;
  bool showCelebration = false;
  int consecutiveCorrectAnswers = 0;
  bool showBigCelebration = false;

  @override
  void initState() {
    super.initState();
    _celebrationController = AnimationController(vsync: this);
    _initializeQuiz();
  }

  /// Initialize the quiz by downloading and caching all images first
  Future<void> _initializeQuiz() async {
    setState(() {
      isLoading = true;
    });

    try {
      // Step 1: Fetch all quiz images from API
      await _fetchAllImages();

      // Step 2: Preload all images into memory cache
      await _preloadAllImages();

      // Step 3: Start the first round
      await _setupNewRound();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to initialize quiz: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  /// Fetch all available quiz images from the API
  Future<void> _fetchAllImages() async {
    final images = await _quizImageService.getQuizImages(
      quizType: 'image_quiz',
    );

    if (images.isEmpty) {
      throw Exception('No quiz images available');
    }

    setState(() {
      allQuizImages = images;
    });
  }

  /// Preload all images into Flutter's image cache
  Future<void> _preloadAllImages() async {
    if (allQuizImages.isEmpty) return;

    // Show progress during preloading
    int loadedCount = 0;
    final totalCount = allQuizImages.length;

    final futures =
        allQuizImages.map((image) async {
          try {
            await precacheImage(NetworkImage(image.imageUrl), context);
            loadedCount++;

            // Update loading progress (optional - you can remove this if not needed)
            if (mounted) {
              setState(() {
                // You can show progress here if desired
              });
            }
          } catch (e) {
            // Continue even if some images fail to preload
            print('Failed to preload image: ${image.imageUrl}');
          }
        }).toList();

    await Future.wait(futures);

    if (mounted) {
      setState(() {
        imagesPreloaded = true;
      });
    }
  }

  /// Setup a new quiz round using cached images
  Future<void> _setupNewRound() async {
    if (allQuizImages.isEmpty) {
      throw Exception('No images available for quiz');
    }

    setState(() {
      isCorrect = null;
      selectedImage = null;
      showCelebration = false;
      showBigCelebration = false;
      isTransitioning = false;
    });

    // Select 6 random images from our cached collection
    final shuffled = List<QuizImage>.from(allQuizImages)..shuffle(random);
    displayedImages = shuffled.take(6).toList();
    correctImage = displayedImages[random.nextInt(6)];

    setState(() {
      isLoading = false;
    });

    // Start speaking immediately since images are already cached
    await _speakWord();
  }

  Future<void> _speakWord() async {
    if (correctImage != null && mounted) {
      await _ttsService.speak("Where is the ${correctImage!.name}?");
    }
  }

  Future<void> _handleImageTap(QuizImage image) async {
    if (selectedImage != null || isTransitioning) return;

    setState(() {
      selectedImage = image;
      isCorrect = image.id == correctImage?.id;
      isTransitioning = true;
    });

    if (isCorrect == true) {
      setState(() {
        consecutiveCorrectAnswers++;
        if (consecutiveCorrectAnswers >= 5) {
          showBigCelebration = true;
          consecutiveCorrectAnswers = 0;
        } else {
          showCelebration = true;
        }
      });

      await _ttsService.speak('Yes, that\'s the ${image.name}!');
      if (showBigCelebration) {
        await _ttsService.speak('Amazing! You got 5 correct answers in a row!');
      }

      // Wait for celebration animation
      await Future.delayed(const Duration(seconds: 2));
      _celebrationController.reset();

      if (mounted) {
        await _setupNewRound();
      }
    } else {
      setState(() => consecutiveCorrectAnswers = 0);
      await _ttsService.speak('Oops, that\'s a ${image.name}. Try again!');

      // Wait a moment then allow another attempt
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) {
        setState(() {
          selectedImage = null;
          isCorrect = null;
          isTransitioning = false;
        });
      }
    }
  }

  Widget _buildImageCard(QuizImage image) {
    final isSelected = selectedImage?.id == image.id;
    final showFeedback = isSelected && isCorrect != null;

    return GestureDetector(
      onTap: () => _handleImageTap(image),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        margin: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: const Color(0xFFE8F5F5),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFF9DD5D5), width: 3),
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
            // Main image content
            Center(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    image.imageUrl,
                    fit: BoxFit.contain,
                    width: double.infinity,
                    height: double.infinity,
                    // Since images are preloaded, they should load instantly
                    // But we keep error handling just in case
                    errorBuilder:
                        (context, error, stackTrace) => Container(
                          decoration: BoxDecoration(
                            color: Colors.grey.shade200,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.image_not_supported,
                            size: 40,
                            color: Colors.grey,
                          ),
                        ),
                  ),
                ),
              ),
            ),

            // Feedback overlay
            if (showFeedback)
              Container(
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.7),
                  borderRadius: BorderRadius.circular(17),
                ),
                child: Center(
                  child:
                      isCorrect == true
                          ? const Icon(
                            Icons.check_circle,
                            color: Colors.green,
                            size: 80,
                          )
                          : const Icon(
                            Icons.sentiment_dissatisfied,
                            color: Colors.orange,
                            size: 80,
                          ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingScreen() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(
            color: Color(0xFF9DD5D5),
            strokeWidth: 4,
          ),
          const SizedBox(height: 24),
          Text(
            imagesPreloaded
                ? 'Setting up quiz...'
                : 'Loading images...\n${allQuizImages.length} images found',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 18,
              color: Color(0xFF4A9B9B),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFB8E6E6),
      body:
          isLoading
              ? _buildLoadingScreen()
              : SafeArea(
                child: Stack(
                  children: [
                    // Main content
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16.0,
                        vertical: 24.0,
                      ),
                      child: GridView.builder(
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              childAspectRatio: 1.0,
                              crossAxisSpacing: 8,
                              mainAxisSpacing: 8,
                            ),
                        itemCount: displayedImages.length,
                        itemBuilder:
                            (context, index) =>
                                _buildImageCard(displayedImages[index]),
                      ),
                    ),

                    // Celebration overlay
                    if (showCelebration || showBigCelebration)
                      Container(
                        color: Colors.black.withOpacity(0.3),
                        child: Center(
                          child: Stack(
                            children: [
                              if (showBigCelebration) ...[
                                Lottie.asset(
                                  'assets/animations/Animation - 1749309499190.json',
                                  controller: _celebrationController,
                                  onLoaded: (composition) {
                                    _celebrationController.duration =
                                        composition.duration;
                                    _celebrationController.forward();
                                  },
                                  fit: BoxFit.cover,
                                ),
                                Center(
                                  child: Container(
                                    padding: const EdgeInsets.all(20),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(20),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withOpacity(0.2),
                                          blurRadius: 10,
                                          offset: const Offset(0, 5),
                                        ),
                                      ],
                                    ),
                                    child: const Text(
                                      '🌟 Amazing! 🌟\n5 in a row!',
                                      style: TextStyle(
                                        fontSize: 28,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF4A9B9B),
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
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
