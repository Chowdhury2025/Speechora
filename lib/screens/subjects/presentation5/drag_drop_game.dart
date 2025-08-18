import 'package:flutter/material.dart';
import 'dart:math';
import '../../../services/tts_service.dart';
import '../../../services/quiz_image_service.dart';
import 'package:lottie/lottie.dart';

class DragDropGame extends StatefulWidget {
  const DragDropGame({super.key});

  @override
  State<DragDropGame> createState() => _DragDropGameState();
}

class _DragDropGameState extends State<DragDropGame>
    with SingleTickerProviderStateMixin {
  final TTSService _ttsService = TTSService();
  final QuizImageService _quizImageService = QuizImageService();
  final Random random = Random();

  bool isWordToPicture = true;
  int level = 1; // 1=Easy(3), 2=Medium(5), 3=Hard(8)

  // Image data
  List<QuizImage> allQuizImages = [];
  bool isLoading = true;
  bool imagesPreloaded = false;
  Map<String, String> currentRoundPairs = {};
  final Map<String, bool> matched = {};
  int completed = 0;
  bool showCelebration = false;
  late final AnimationController _celebrationController;

  @override
  void initState() {
    super.initState();
    _celebrationController = AnimationController(vsync: this);
    _initializeGame();
  }

  Future<void> _initializeGame() async {
    setState(() {
      isLoading = true;
    });

    try {
      // Fetch images from API
      await _fetchAllImages();

      // Preload images
      await _preloadAllImages();

      // Setup first round
      _setupRound();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to initialize game: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _fetchAllImages() async {
    final images = await _quizImageService.getQuizImages();

    if (images.isEmpty) {
      throw Exception('No quiz images available');
    }

    setState(() {
      allQuizImages = images;
    });
  }

  Future<void> _preloadAllImages() async {
    if (allQuizImages.isEmpty) return;

    final futures =
        allQuizImages.map((image) async {
          try {
            await precacheImage(NetworkImage(image.imageUrl), context);
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

  void _setupRound() {
    if (allQuizImages.isEmpty) {
      throw Exception('No images available for game');
    }

    // Select random images based on difficulty level
    int itemCount = level == 1 ? 3 : (level == 2 ? 5 : 8);

    // Make sure we don't try to use more images than available
    itemCount = min(itemCount, allQuizImages.length);

    final shuffled = List<QuizImage>.from(allQuizImages)..shuffle(random);
    final selectedImages = shuffled.take(itemCount).toList();

    // Create word-image pairs
    currentRoundPairs = {};
    matched.clear();

    for (var image in selectedImages) {
      currentRoundPairs[image.name] = image.imageUrl;
      matched[image.name] = false;
    }

    completed = 0;
    showCelebration = false;

    setState(() {
      isLoading = false;
    });
  }

  Future<void> _onCorrect(String word) async {
    setState(() {
      matched[word] = true;
      completed = matched.values.where((v) => v).length;
    });

    await _ttsService.speak(word);

    if (completed == currentRoundPairs.length) {
      setState(() => showCelebration = true);
      await _ttsService.speak("Great job!");

      // Wait for celebration
      await Future.delayed(const Duration(seconds: 2));

      if (mounted) {
        setState(() => showCelebration = false);
        _setupRound(); // Setup next round
      }
    }
  }

  void _onWrong() {
    _ttsService.speak("Try again");
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return _buildLoadingScreen();
    }

    final draggableArea =
        isWordToPicture ? _buildDraggableWords() : _buildDraggablePictures();

    final targetArea =
        isWordToPicture ? _buildPictureTargets() : _buildWordTargets();

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFB8E6E6),
        title: const Text("Drag & Drop Learning"),
        actions: [
          IconButton(
            tooltip: "Reset Round",
            onPressed:
                () => setState(() {
                  _setupRound();
                }),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16.0,
                  vertical: 8,
                ),
                child: Row(
                  children: [
                    const Text("Mode:", style: TextStyle(fontSize: 16)),
                    const SizedBox(width: 8),
                    ChoiceChip(
                      selected: isWordToPicture,
                      onSelected:
                          (_) => setState(() {
                            isWordToPicture = true;
                            _setupRound();
                          }),
                      label: const Text("Word → Picture"),
                    ),
                    const SizedBox(width: 8),
                    ChoiceChip(
                      selected: !isWordToPicture,
                      onSelected:
                          (_) => setState(() {
                            isWordToPicture = false;
                            _setupRound();
                          }),
                      label: const Text("Picture → Word"),
                    ),
                    const Spacer(),
                    const Text("Level:", style: TextStyle(fontSize: 16)),
                    const SizedBox(width: 8),
                    DropdownButton<int>(
                      value: level,
                      items: const [
                        DropdownMenuItem(value: 1, child: Text("Easy (3)")),
                        DropdownMenuItem(value: 2, child: Text("Medium (5)")),
                        DropdownMenuItem(value: 3, child: Text("Hard (8)")),
                      ],
                      onChanged:
                          (v) => setState(() {
                            level = v ?? 1;
                            _setupRound();
                          }),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              Expanded(child: draggableArea),
              const Divider(thickness: 2),
              Expanded(child: targetArea),
            ],
          ),
          if (showCelebration) _buildCelebration(),
        ],
      ),
    );
  }

  Widget _buildLoadingScreen() {
    return Scaffold(
      backgroundColor: const Color(0xFFB8E6E6),
      body: Center(
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
                  ? 'Setting up game...'
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
      ),
    );
  }

  // DRAGGABLES
  Widget _buildDraggableWords() {
    return _wrapGrid(
      currentRoundPairs.keys.map((word) {
        final done = matched[word] ?? false;
        return done
            ? _emptyBox()
            : Draggable<String>(
              data: word,
              feedback: _wordTile(
                word,
                const Color(0xFF4A9B9B).withOpacity(0.8),
              ),
              childWhenDragging: _ghostBox(),
              child: _wordTile(word, const Color(0xFF4A9B9B)),
            );
      }).toList(),
    );
  }

  Widget _buildDraggablePictures() {
    return _wrapGrid(
      currentRoundPairs.entries.map((e) {
        final done = matched[e.key] ?? false;
        return done
            ? _emptyBox()
            : Draggable<String>(
              data: e.key,
              feedback: _imageTile(
                e.value,
                const Color(0xFF4A9B9B).withOpacity(0.8),
              ),
              childWhenDragging: _ghostBox(),
              child: _imageTile(e.value, const Color(0xFF4A9B9B)),
            );
      }).toList(),
    );
  }

  // TARGETS
  Widget _buildPictureTargets() {
    return _wrapGrid(
      currentRoundPairs.entries.map((e) {
        final word = e.key;
        final imgUrl = e.value;
        final done = matched[word] ?? false;
        return DragTarget<String>(
          builder: (context, candidate, rejected) {
            return AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeOut,
              decoration: BoxDecoration(
                color:
                    done
                        ? Colors.lightGreen
                        : (candidate.isNotEmpty
                            ? Colors.grey.shade300
                            : Colors.grey.shade200),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  if (done)
                    const BoxShadow(
                      color: Colors.greenAccent,
                      blurRadius: 12,
                      spreadRadius: 2,
                    ),
                ],
              ),
              width: 110,
              height: 110,
              padding: const EdgeInsets.all(8),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  imgUrl,
                  fit: BoxFit.cover,
                  errorBuilder:
                      (context, error, stackTrace) => Container(
                        color: Colors.grey.shade300,
                        child: const Icon(
                          Icons.image_not_supported,
                          color: Colors.grey,
                        ),
                      ),
                ),
              ),
            );
          },
          onAccept: (data) {
            if (data == word) {
              _onCorrect(word);
            } else {
              _onWrong();
            }
          },
        );
      }).toList(),
    );
  }

  Widget _buildWordTargets() {
    return _wrapGrid(
      currentRoundPairs.keys.map((word) {
        final done = matched[word] ?? false;
        return DragTarget<String>(
          builder: (context, candidate, rejected) {
            return AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeOut,
              decoration: BoxDecoration(
                color:
                    done
                        ? Colors.lightGreen
                        : (candidate.isNotEmpty
                            ? Colors.grey.shade300
                            : Colors.grey.shade200),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  if (done)
                    const BoxShadow(
                      color: Colors.greenAccent,
                      blurRadius: 12,
                      spreadRadius: 2,
                    ),
                ],
              ),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Text(
                word,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: done ? Colors.white : Colors.black87,
                ),
              ),
            );
          },
          onAccept: (data) {
            if (data == word) {
              _onCorrect(word);
            } else {
              _onWrong();
            }
          },
        );
      }).toList(),
    );
  }

  // HELPERS
  Widget _wrapGrid(List<Widget> children) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(12),
        child: Wrap(
          spacing: 12,
          runSpacing: 12,
          alignment: WrapAlignment.center,
          children: children,
        ),
      ),
    );
  }

  Widget _wordTile(String word, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        word,
        style: const TextStyle(
          fontSize: 20,
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _imageTile(String path, Color color) {
    return Container(
      width: 110,
      height: 110,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.all(8),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: Image.network(
          path,
          fit: BoxFit.cover,
          errorBuilder:
              (context, error, stackTrace) => Container(
                color: Colors.grey.shade300,
                child: const Icon(
                  Icons.image_not_supported,
                  color: Colors.grey,
                ),
              ),
        ),
      ),
    );
  }

  Widget _ghostBox() =>
      Container(width: 110, height: 110, color: Colors.transparent);
  Widget _emptyBox() => const SizedBox(width: 110, height: 110);

  Widget _buildCelebration() {
    return Container(
      color: Colors.black.withOpacity(0.3),
      child: Center(
        child: Stack(
          children: [
            Lottie.asset(
              'assets/animations/Animation - 1749309499190.json',
              controller: _celebrationController,
              onLoaded: (composition) {
                _celebrationController.duration = composition.duration;
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
                  '🎉 Great job! 🎉',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF4A9B9B),
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
    _celebrationController.dispose();
    super.dispose();
  }
}
