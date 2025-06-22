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
              : Container(
                decoration: const BoxDecoration(color: Colors.white),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Score: $score',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 20),
                      if (currentFruit != null) ...[
                        Container(
                          width: 200,
                          height: 200,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withOpacity(0.5),
                                spreadRadius: 2,
                                blurRadius: 5,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: CachedNetworkImage(
                              imageUrl: currentFruit!.imageUrl,
                              fit: BoxFit.cover,
                              placeholder:
                                  (context, url) => const Center(
                                    child: CircularProgressIndicator(),
                                  ),
                              errorWidget:
                                  (context, url, error) =>
                                      const Icon(Icons.error),
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        GestureDetector(
                          onTap:
                              _speakQuestion, // Allow tapping the question to repeat it
                          child: Text(
                            'Is this a $askedFruitName?',
                            style: const TextStyle(fontSize: 24),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 20),
                        if (showOopsMessage)
                          Text(
                            'Wrong! Try again! This is not $askedFruitName',
                            style: const TextStyle(
                              color: Colors.red,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        const SizedBox(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            ElevatedButton(
                              onPressed: () => _handleAnswer(true),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.green,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 50,
                                  vertical: 20,
                                ),
                              ),
                              child: const Text(
                                'TRUE',
                                style: TextStyle(fontSize: 20),
                              ),
                            ),
                            ElevatedButton(
                              onPressed: () => _handleAnswer(false),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.red,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 50,
                                  vertical: 20,
                                ),
                              ),
                              child: const Text(
                                'FALSE',
                                style: TextStyle(fontSize: 20),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ),
    );
  }
}
