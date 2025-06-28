import 'package:flutter/material.dart';
import 'package:book8/services/quiz_image_service.dart';
import 'package:book8/services/tts_service.dart';
import 'dart:math';
import 'package:cached_network_image/cached_network_image.dart';

class FruitQuizApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'YES OR NO Quiz',
      theme: ThemeData(primarySwatch: Colors.blue, fontFamily: 'Roboto'),
      home: TrueOrFalse(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class Fruit {
  final String name;
  final String imageUrl;
  final Color color;

  const Fruit({
    required this.name,
    required this.imageUrl,
    required this.color,
  });

  factory Fruit.fromQuizImage(dynamic quizImage) {
    return Fruit(
      name: quizImage.name ?? '',
      imageUrl: quizImage.imageUrl ?? '',
      color: Colors.blue, // Default color since we're using actual images now
    );
  }
}

class TrueOrFalse extends StatefulWidget {
  const TrueOrFalse({Key? key}) : super(key: key);

  @override
  _TrueOrFalseState createState() => _TrueOrFalseState();
}

class _TrueOrFalseState extends State<TrueOrFalse>
    with TickerProviderStateMixin {
  final QuizImageService _quizImageService = QuizImageService();
  final TTSService _ttsService = TTSService();
  List<Fruit> fruits = [];
  Fruit? currentFruit;
  String? askedFruitName;
  bool showOopsMessage = false;
  bool isCorrect = false;
  int score = 0;
  int totalQuestions = 0;
  bool isLoading = true;
  String errorMessage = '';

  AnimationController? _bounceController;
  AnimationController? _fadeController;
  Animation<double>? _bounceAnimation;
  Animation<double>? _fadeAnimation;
  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _initializeTTS();
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

    _bounceAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _bounceController!, curve: Curves.elasticOut),
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(parent: _fadeController!, curve: Curves.easeIn));
  }

  Future<void> _initializeTTS() async {
    await _ttsService.init();
  }

  Future<void> _loadQuizImages() async {
    try {
      setState(() {
        isLoading = true;
        errorMessage = '';
      });

      final images = await _quizImageService.getQuizImages();
      final trueFalseImages =
          images
              .where(
                (img) =>
                    (img.quizTypes as List<dynamic>).contains('true_false'),
              )
              .toList();

      setState(() {
        fruits =
            trueFalseImages.map((img) => Fruit.fromQuizImage(img)).toList();
        isLoading = false;
      });

      if (fruits.isNotEmpty) {
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
    if (fruits.isEmpty) return;

    setState(() {
      currentFruit = fruits[Random().nextInt(fruits.length)];
      // 50-50 chance to ask about the correct name or a different name
      if (Random().nextBool()) {
        askedFruitName = currentFruit!.name;
      } else {
        // Get a different random fruit name
        var otherFruits =
            fruits.where((f) => f.name != currentFruit!.name).toList();
        if (otherFruits.isNotEmpty) {
          askedFruitName =
              otherFruits[Random().nextInt(otherFruits.length)].name;
        } else {
          askedFruitName =
              currentFruit!.name; // Fallback if there's only one fruit
        }
      }
      showOopsMessage = false;
    });

    // Speak the question after state is updated
    _speakQuestion();
  }

  void _handleAnswer(bool userAnswer) async {
    bool isCorrectName = currentFruit!.name == askedFruitName;
    if (userAnswer == isCorrectName) {
      await _speakFeedback(true);
      setState(() {
        score++;
      });
      await _speakScore();
      _generateNewQuestion();
    } else {
      await _speakFeedback(false);
      setState(() {
        showOopsMessage = true;
      });
    }
  }

  Future<void> _speakQuestion() async {
    if (currentFruit != null && askedFruitName != null) {
      await _ttsService.speak('Is this a $askedFruitName?');
    }
  }

  Future<void> _speakFeedback(bool isCorrect) async {
    if (isCorrect) {
      await _ttsService.speak('Yes! This is ${currentFruit!.name}');
    } else {
      await _ttsService.speak(
        'Wrong! Try again! This is not ${askedFruitName}',
      );
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
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFBEE9E8),
      appBar: AppBar(
        title: const Text('True or False'),
        backgroundColor: Colors.blue,
        actions: [
          if (currentFruit != null)
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
              : fruits.isEmpty
              ? const Center(child: Text('No quiz images available'))
              : SafeArea(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    // Question
                    Padding(
                      padding: const EdgeInsets.only(top: 24.0, bottom: 8.0),
                      child: Text(
                        'Is this a $askedFruitName?',
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF223A5E),
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    // Fruit image with rounded background
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF3C7),
                        borderRadius: BorderRadius.circular(32),
                      ),
                      padding: const EdgeInsets.all(24),
                      child: SizedBox(
                        width: 140,
                        height: 140,
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(24),
                          child:
                              currentFruit != null
                                  ? CachedNetworkImage(
                                    imageUrl: currentFruit!.imageUrl,
                                    fit: BoxFit.contain,
                                    placeholder:
                                        (context, url) => const Center(
                                          child: CircularProgressIndicator(),
                                        ),
                                    errorWidget:
                                        (context, url, error) =>
                                            const Icon(Icons.error),
                                  )
                                  : const SizedBox.shrink(),
                        ),
                      ),
                    ),
                    // Oops/feedback message
                    if (showOopsMessage)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 12.0),
                        child: Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFE0B2),
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
                            color: const Color(0xFFFFF3C7),
                            borderRadius: BorderRadius.circular(18),
                          ),
                          padding: const EdgeInsets.symmetric(
                            vertical: 16,
                            horizontal: 12,
                          ),
                          child: Text(
                            'No, this is ${currentFruit?.name ?? ''}',
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
    );
  }
}
