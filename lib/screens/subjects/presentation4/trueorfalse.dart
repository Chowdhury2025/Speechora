import 'package:flutter/material.dart';
import 'dart:math';
import '../../../services/tts_service.dart';

void main() {
  runApp(FruitQuizApp());
}

class FruitQuizApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'YES OR NO Quiz',
      theme: ThemeData(primarySwatch: Colors.blue, fontFamily: 'Roboto'),
      home: true_false_quiz(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class Fruit {
  final String name;
  final String emoji;
  final Color color;

  Fruit({required this.name, required this.emoji, required this.color});
}

class true_false_quiz extends StatefulWidget {
  @override
  _true_false_quizState createState() => _true_false_quizState();
}

class _true_false_quizState extends State<true_false_quiz>
    with TickerProviderStateMixin {
  final TTSService _ttsService = TTSService();
  Random random = Random();

  // List of 15+ fruits
  List<Fruit> fruits = [
    Fruit(name: "banana", emoji: "🍌", color: Colors.yellow),
    Fruit(name: "orange", emoji: "🍊", color: Colors.orange),
    Fruit(name: "apple", emoji: "🍎", color: Colors.red),
    Fruit(name: "grape", emoji: "🍇", color: Colors.purple),
    Fruit(name: "strawberry", emoji: "🍓", color: Colors.red),
    Fruit(name: "watermelon", emoji: "🍉", color: Colors.green),
    Fruit(name: "pineapple", emoji: "🍍", color: Colors.yellow),
    Fruit(name: "peach", emoji: "🍑", color: Colors.pink),
    Fruit(name: "lemon", emoji: "🍋", color: Colors.yellow),
    Fruit(name: "kiwi", emoji: "🥝", color: Colors.brown),
    Fruit(name: "mango", emoji: "🥭", color: Colors.orange),
    Fruit(name: "coconut", emoji: "🥥", color: Colors.brown),
    Fruit(name: "avocado", emoji: "🥑", color: Colors.green),
    Fruit(name: "cherry", emoji: "🍒", color: Colors.red),
    Fruit(name: "blueberry", emoji: "🫐", color: Colors.blue),
    Fruit(name: "pear", emoji: "🍐", color: Colors.green),
  ];

  Fruit? currentFruit;
  String? askedFruitName;
  bool showOopsMessage = false;
  bool isCorrect = false;
  int score = 0;
  int totalQuestions = 0;

  AnimationController? _bounceController;
  AnimationController? _fadeController;
  Animation<double>? _bounceAnimation;
  Animation<double>? _fadeAnimation;
  @override
  void initState() {
    super.initState();
    _ttsService.init();
    _setupAnimations();
    _generateNewQuestion();
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

  void _generateNewQuestion() {
    setState(() {
      // Pick a random fruit to display
      currentFruit = fruits[random.nextInt(fruits.length)];

      // Pick a random fruit name to ask about (could be same or different)
      askedFruitName = fruits[random.nextInt(fruits.length)].name;

      showOopsMessage = false;
      isCorrect = false;
      totalQuestions++;
    });

    _fadeController!.forward();

    // Speak the question
    _speakQuestion();
  }

  void _speakQuestion() async {
    await _ttsService.speak("Is this a $askedFruitName?");
  }

  void _handleAnswer(bool userAnswer) {
    bool correctAnswer = currentFruit!.name == askedFruitName;

    if (userAnswer == correctAnswer) {
      // Correct answer
      setState(() {
        isCorrect = true;
        score++;
      });
      _bounceController!.forward().then((_) {
        _bounceController!.reverse();
      });

      // Wait a bit then generate new question
      Future.delayed(Duration(milliseconds: 1500), () {
        _fadeController!.reset();
        _generateNewQuestion();
      });
    } else {
      // Wrong answer - show "Oops, try again!"
      setState(() {
        showOopsMessage = true;
      });

      // Hide the message after 2 seconds and allow user to try again
      Future.delayed(Duration(milliseconds: 2000), () {
        setState(() {
          showOopsMessage = false;
        });
      });
    }
  }

  @override
  void dispose() {
    _bounceController?.dispose();
    _fadeController?.dispose();
    _ttsService.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFB8E6E6), // Light blue-green background
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(20.0),
          child: Column(
            children: [
              // Score display
              Container(
                padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'Score: $score / $totalQuestions',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2D5A87),
                  ),
                ),
              ),

              SizedBox(height: 30),

              // Question text
              FadeTransition(
                opacity: _fadeAnimation!,
                child: Text(
                  'Is this a $askedFruitName?',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2D5A87),
                  ),
                  textAlign: TextAlign.center,
                ),
              ),

              SizedBox(height: 40),

              // Fruit display container
              Expanded(
                flex: 3,
                child: Container(
                  width: double.infinity,
                  margin: EdgeInsets.symmetric(horizontal: 20),
                  decoration: BoxDecoration(
                    color: Color(0xFFFFF8DC), // Light cream color
                    borderRadius: BorderRadius.circular(30),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                        offset: Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Stack(
                    children: [
                      // Main fruit display
                      Center(
                        child: AnimatedBuilder(
                          animation: _bounceAnimation!,
                          builder: (context, child) {
                            return Transform.scale(
                              scale: _bounceAnimation!.value,
                              child: Text(
                                currentFruit?.emoji ?? '',
                                style: TextStyle(fontSize: 120),
                              ),
                            );
                          },
                        ),
                      ),

                      // Oops message overlay
                      if (showOopsMessage)
                        Positioned(
                          left: 20,
                          right: 20,
                          bottom: 30,
                          child: Container(
                            padding: EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 15,
                            ),
                            decoration: BoxDecoration(
                              color: Color(
                                0xFFFFCCB3,
                              ), // Light orange background
                              borderRadius: BorderRadius.circular(25),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.2),
                                  blurRadius: 8,
                                  offset: Offset(0, 3),
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text('😔', style: TextStyle(fontSize: 24)),
                                SizedBox(width: 10),
                                Text(
                                  'Oops,\ntry again!',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF2D5A87),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),

              SizedBox(height: 40),

              // Answer buttons
              Row(
                children: [
                  // Yes button
                  Expanded(
                    child: GestureDetector(
                      onTap: () => _handleAnswer(true),
                      child: Container(
                        padding: EdgeInsets.symmetric(vertical: 20),
                        margin: EdgeInsets.only(right: 10),
                        decoration: BoxDecoration(
                          color: Color(0xFFF0FFF0), // Light green
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.green, width: 2),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 5,
                              offset: Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Icon(Icons.check, size: 30, color: Colors.green),
                            SizedBox(height: 5),
                            Text(
                              'Yes',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF2D5A87),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // No button
                  Expanded(
                    child: GestureDetector(
                      onTap: () => _handleAnswer(false),
                      child: Container(
                        padding: EdgeInsets.symmetric(vertical: 20),
                        margin: EdgeInsets.only(left: 10),
                        decoration: BoxDecoration(
                          color: Color(0xFFFFE4E1), // Light red
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.red, width: 2),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 5,
                              offset: Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Icon(Icons.close, size: 30, color: Colors.red),
                            SizedBox(height: 5),
                            Text(
                              'No',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF2D5A87),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              SizedBox(height: 30),

              // Answer feedback
              if (isCorrect && !showOopsMessage)
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                  decoration: BoxDecoration(
                    color: Color(0xFFF0FFF0),
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: Text(
                    currentFruit!.name == askedFruitName
                        ? 'Yes, this is ${currentFruit!.name.startsWith('a') ? 'an' : 'a'} ${currentFruit!.name}.'
                        : 'No, this is ${currentFruit!.name.startsWith('a') ? 'an' : 'a'} ${currentFruit!.name}.',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF2D5A87),
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),

              SizedBox(height: 20),

              // Replay button
              GestureDetector(
                onTap: _speakQuestion,
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.9),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Color(0xFF2D5A87), width: 2),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.volume_up, color: Color(0xFF2D5A87)),
                      SizedBox(width: 8),
                      Text(
                        'Replay Question',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF2D5A87),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
