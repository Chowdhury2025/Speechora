import 'package:flutter/material.dart';
import 'package:speachora/services/quiz_image_service.dart';
import 'package:speachora/services/tts_service.dart';
import 'dart:math';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:lottie/lottie.dart';

class itemQuizApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'YES OR NO Quiz',
      theme: ThemeData(primarySwatch: Colors.blue, fontFamily: 'Roboto'),
      home: BasicResponses(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class item {
  final String name;
  final String imageUrl;
  final Color color;

  const item({required this.name, required this.imageUrl, required this.color});

  factory item.fromQuizImage(dynamic quizImage) {
    return item(
      name: quizImage.name ?? '',
      imageUrl: quizImage.imageUrl ?? '',
      color: Colors.blue, // Default color since we're using actual images now
    );
  }
}

class BasicResponses extends StatefulWidget {
  final Color backgroundColor;
  final String title;

  const BasicResponses({
    Key? key,
    this.backgroundColor = const Color(0xFF58CC02),
    this.title = 'Yes or No Quiz',
  }) : super(key: key);

  @override
  _BasicResponsesState createState() => _BasicResponsesState();
}

class _BasicResponsesState extends State<BasicResponses>
    with TickerProviderStateMixin {
  QuizImageService? _quizImageService;
  final TTSService _ttsService = TTSService();
  List<item> items = [];
  item? currentitem;
  String? askeditemName;
  bool showOopsMessage = false;
  bool isCorrect = false;
  int score = 0;
  int totalQuestions = 0;
  bool isLoading = true;
  String errorMessage = '';
  int consecutiveCorrectAnswers = 0;
  bool showCompletionAnimation = false;

  AnimationController? _bounceController;
  AnimationController? _fadeController;
  AnimationController? _completionController;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _initializeTTS();
    _initializeService();
  }

  Future<void> _initializeService() async {
    _quizImageService = await QuizImageService.instance;
    _loadQuizImages();
  }

  void _setupAnimations() {
    _bounceController = AnimationController(
      duration: Duration(milliseconds: 600),
      vsync: this,
    );
    _fadeController = AnimationController(
      duration: Duration(milliseconds: 500),
      vsync: this,
    );
    _completionController = AnimationController(
      duration: Duration(milliseconds: 2000),
      vsync: this,
    );
  }

  Future<void> _initializeTTS() async {
    await _ttsService.init();
  }

  Future<void> _loadQuizImages() async {
    if (_quizImageService == null) return;

    try {
      setState(() {
        isLoading = true;
        errorMessage = '';
      });

      final images = await _quizImageService!.getQuizImages();
      final trueFalseImages =
          images
              .where(
                (img) =>
                    (img.quizTypes as List<dynamic>).contains('true_false'),
              )
              .toList();

      setState(() {
        items = trueFalseImages.map((img) => item.fromQuizImage(img)).toList();
        isLoading = false;
      });

      if (items.isNotEmpty) {
        _generateNewQuestion();
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = 'Failed to load quiz images: $e';
      });
    }
  }

  void _generateNewQuestion() {
    if (items.isEmpty) return;

    setState(() {
      currentitem = items[Random().nextInt(items.length)];
      // 50-50 chance to ask about the correct name or a different name
      if (Random().nextBool()) {
        askeditemName = currentitem!.name;
      } else {
        // Get a different random item name
        var otheritems =
            items.where((f) => f.name != currentitem!.name).toList();
        if (otheritems.isNotEmpty) {
          askeditemName = otheritems[Random().nextInt(otheritems.length)].name;
        } else {
          askeditemName =
              currentitem!.name; // Fallback if there's only one item
        }
      }
      showOopsMessage = false;
    });

    // Speak the question after state is updated
    _speakQuestion();
  }

  void _handleAnswer(bool userAnswer) async {
    bool isCorrectName = currentitem!.name == askeditemName;
    if (userAnswer == isCorrectName) {
      await _speakFeedback(true);
      setState(() {
        score++;
        consecutiveCorrectAnswers++;

        // Show completion animation after 5 correct answers in a row
        if (consecutiveCorrectAnswers == 5) {
          showCompletionAnimation = true;
          _completionController?.forward().then((_) {
            Future.delayed(Duration(seconds: 2), () {
              setState(() {
                showCompletionAnimation = false;
                consecutiveCorrectAnswers = 0;
              });
              _completionController?.reset();
            });
          });
        }
      });
      await _speakScore();
      _generateNewQuestion();
    } else {
      await _speakFeedback(false);
      setState(() {
        showOopsMessage = true;
        consecutiveCorrectAnswers = 0; // Reset consecutive correct answers
      });
    }
  }

  Future<void> _speakQuestion() async {
    if (currentitem != null && askeditemName != null) {
      await _ttsService.speak('Is this a $askeditemName?');
    }
  }

  Future<void> _speakFeedback(bool isCorrect) async {
    if (isCorrect) {
      await _ttsService.speak('Yes! This is ${currentitem!.name}');
    } else {
      await _ttsService.speak('Wrong! Try again! This is not ');
    }
  }

  Future<void> _speakScore() async {
    await _ttsService.speak('Your score is $score');
  }

  @override
  void dispose() {
    _ttsService.stop();
    _bounceController?.dispose();
    _fadeController?.dispose();
    _completionController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Scaffold(
          backgroundColor: widget.backgroundColor,
          appBar: AppBar(
            title: Text(widget.title),
            backgroundColor: widget.backgroundColor,
            elevation: 0,
            actions: [
              if (currentitem != null)
                IconButton(
                  icon: const Icon(Icons.volume_up),
                  onPressed: _speakQuestion,
                  tooltip: 'Repeat question',
                ),
            ],
          ),
          body:
              isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : errorMessage.isNotEmpty
                  ? Center(child: Text(errorMessage))
                  : items.isEmpty
                  ? const Center(child: Text('No quiz images available'))
                  : SafeArea(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        // Question
                        Padding(
                          padding: const EdgeInsets.only(
                            top: 24.0,
                            bottom: 8.0,
                          ),
                          child: Text(
                            'Is this a $askeditemName?',
                            style: const TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF223A5E),
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        // item image with rounded background
                        Card(
                          elevation: 8,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          margin: const EdgeInsets.symmetric(horizontal: 20),
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            padding: const EdgeInsets.all(
                              16,
                            ), // Reduced from 24 to 16
                            child: SizedBox(
                              width: 280,
                              height: 280,
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(
                                  12,
                                ), // Reduced from 24 to 12
                                child:
                                    currentitem != null
                                        ? CachedNetworkImage(
                                          imageUrl: currentitem!.imageUrl,
                                          fit: BoxFit.contain,
                                          placeholder:
                                              (context, url) => const Center(
                                                child:
                                                    CircularProgressIndicator(),
                                              ),
                                          errorWidget:
                                              (context, url, error) =>
                                                  const Icon(Icons.error),
                                        )
                                        : const SizedBox.shrink(),
                              ),
                            ),
                          ),
                        ),
                        // Oops/feedback message
                        if (showOopsMessage)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 12.0),
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(24),
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                                vertical: 12,
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: const [
                                  Text('😕', style: TextStyle(fontSize: 28)),
                                  SizedBox(width: 10),
                                  Text(
                                    'Oops, try again!',
                                    style: TextStyle(
                                      fontSize: 22,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF223A5E),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        // Yes/No buttons
                        Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24.0,
                            vertical: 8.0,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () => _handleAnswer(true),
                                  icon: const Icon(
                                    Icons.check,
                                    size: 36,
                                    color: Colors.white,
                                  ),
                                  label: const Text(
                                    'Yes',
                                    style: TextStyle(
                                      fontSize: 24,
                                      color: Colors.white,
                                    ),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF8ED081),
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 20,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(18),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 24),
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () => _handleAnswer(false),
                                  icon: const Icon(
                                    Icons.close,
                                    size: 36,
                                    color: Colors.white,
                                  ),
                                  label: const Text(
                                    'No',
                                    style: TextStyle(
                                      fontSize: 24,
                                      color: Colors.white,
                                    ),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFFFF8C8C),
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 20,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(18),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Bottom feedback/answer
                        if (showOopsMessage)
                          Padding(
                            padding: const EdgeInsets.only(
                              top: 16.0,
                              left: 24,
                              right: 24,
                            ),
                            child: Container(
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.9),
                                borderRadius: BorderRadius.circular(18),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.1),
                                    blurRadius: 8,
                                    spreadRadius: 1,
                                  ),
                                ],
                              ),
                              padding: const EdgeInsets.symmetric(
                                vertical: 16,
                                horizontal: 12,
                              ),
                              child: Text(
                                'No, this is ${currentitem?.name ?? ''}',
                                style: const TextStyle(
                                  fontSize: 22,
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
        ),
        if (showCompletionAnimation)
          Positioned.fill(
            child: Container(
              color: Colors.black54,
              child: Center(
                child: Lottie.asset(
                  'assets/animations/completed_a_task.json',
                  controller: _completionController,
                  width: 300,
                  height: 300,
                  fit: BoxFit.contain,
                  repeat: true,
                ),
              ),
            ),
          ),
      ],
    );
  }
}
