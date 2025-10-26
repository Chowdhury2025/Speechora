import 'package:flutter/material.dart';
import '../../../services/tts_service.dart';

class QuizItem {
  final String subject;
  final String imageUrl;
  final String imageName;
  final String description;
  final String ageGroup;

  QuizItem({
    required this.subject,
    required this.imageUrl,
    required this.imageName,
    required this.description,
    required this.ageGroup,
  });

  factory QuizItem.fromJson(Map<String, dynamic> json) => QuizItem(
    subject: json['subject'],
    imageUrl: json['imageUrl'],
    imageName: json['imageName'],
    description: json['description'],
    ageGroup: json['ageGroup'],
  );
}

class Presentation3 extends StatefulWidget {
  final String subject;
  final int initialIndex;
  final List<QuizItem> items;

  const Presentation3({
    Key? key,
    required this.subject,
    this.initialIndex = 0,
    required this.items,
  }) : super(key: key);

  @override
  _Presentation3State createState() => _Presentation3State();
}

class _Presentation3State extends State<Presentation3>
    with SingleTickerProviderStateMixin {
  final TTSService _tts = TTSService();
  final List<QuizItem> _items = [];
  int _currentIndex = 0;
  QuizItem? _selected;
  bool _hasError = false;
  String? _errorMessage;
  late AnimationController _questionAnimationController;
  late Animation<double> _questionAnimation;

  @override
  void initState() {
    super.initState();
    _questionAnimationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _questionAnimation = Tween<double>(begin: 1.0, end: 1.1).animate(
      CurvedAnimation(
        parent: _questionAnimationController,
        curve: Curves.easeInOut,
      ),
    )..addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _questionAnimationController.reverse();
      }
    });
    _initializeItems();
  }

  @override
  void dispose() {
    _questionAnimationController.dispose();
    super.dispose();
  }

  void _initializeItems() {
    setState(() {
      _items.addAll(widget.items);
      _currentIndex = widget.initialIndex;
      if (_items.length < 2) {
        _hasError = true;
        _errorMessage = 'Not enough items to display. Please add more.';
        return;
      }
    });

    // Ask the first question once the UI is built
    WidgetsBinding.instance.addPostFrameCallback((_) => _askQuestion());
  }

  Future<void> _askQuestion() async {
    final a = _items[_currentIndex];
    final b = _items[(_currentIndex + 1) % _items.length];
    _questionAnimationController.forward();
    await _tts.speak("Do you want ${a.imageName} or ${b.imageName}?");
  }

  Future<void> _onSelect(QuizItem choice) async {
    if (_selected != null) return;
    setState(() => _selected = choice);
    await _tts.speak("I want ${choice.imageName}");
    // after a short delay, advance
    await Future.delayed(const Duration(seconds: 2));
    setState(() {
      _currentIndex = (_currentIndex + 2) % _items.length;
      _selected = null;
    });
    _askQuestion();
  }

  // Removed unused _buildOptionCard method

  @override
  Widget build(BuildContext context) {
    if (_hasError) {
      return Scaffold(
        body: Center(
          child: Text(
            _errorMessage ?? 'An error occurred.',
            style: const TextStyle(fontSize: 18, color: Colors.red),
          ),
        ),
      );
    }
    if (_items.length < 2) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final first = _items[_currentIndex];
    final second = _items[(_currentIndex + 1) % _items.length];

    // Get screen size for responsive sizing
    final screenSize = MediaQuery.of(context).size;
    final isSmallScreen = screenSize.height < 700;

    return Scaffold(
      backgroundColor: const Color(
        0xFFB8E4DA,
      ), // Light teal background like in the image
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1E4147)),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Top Question Text
              Padding(
                padding: EdgeInsets.fromLTRB(
                  24,
                  isSmallScreen ? 20 : 30,
                  24,
                  isSmallScreen ? 20 : 40,
                ),
                child: ScaleTransition(
                  scale: _questionAnimation,
                  child: Text(
                    "Do you want ${first.imageName} or ${second.imageName}?",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize:
                          isSmallScreen
                              ? 34
                              : 42, // Adjust font size for smaller screens
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF1E4147), // Dark teal text
                      height: 1.2,
                    ),
                  ),
                ),
              ),

              // Options as separate cards with images
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Column(
                  children: [
                    // First option (Water)
                    GestureDetector(
                      onTap: () => _onSelect(first),
                      child: Container(
                        width: double.infinity,
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: EdgeInsets.all(isSmallScreen ? 16 : 24),
                        decoration: BoxDecoration(
                          color: const Color(
                            0xFFDEF3FA,
                          ), // Light blue for water
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                first.imageUrl,
                                height: isSmallScreen ? 90 : 120,
                                fit: BoxFit.contain,
                                errorBuilder:
                                    (context, error, stackTrace) => Icon(
                                      Icons.image_not_supported,
                                      size: isSmallScreen ? 60 : 80,
                                      color: Colors.grey[400],
                                    ),
                              ),
                            ),
                            SizedBox(height: isSmallScreen ? 8 : 16),
                            Text(
                              first.imageName,
                              style: TextStyle(
                                fontSize: isSmallScreen ? 24 : 32,
                                fontWeight: FontWeight.bold,
                                color: const Color(0xFF1E4147),
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Second option (Juice)
                    GestureDetector(
                      onTap: () => _onSelect(second),
                      child: Container(
                        width: double.infinity,
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: EdgeInsets.all(isSmallScreen ? 16 : 24),
                        decoration: BoxDecoration(
                          color: const Color(
                            0xFFFFD699,
                          ), // Light orange for juice
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                second.imageUrl,
                                height: isSmallScreen ? 90 : 120,
                                fit: BoxFit.contain,
                                errorBuilder:
                                    (context, error, stackTrace) => Icon(
                                      Icons.image_not_supported,
                                      size: isSmallScreen ? 60 : 80,
                                      color: Colors.grey[400],
                                    ),
                              ),
                            ),
                            SizedBox(height: isSmallScreen ? 8 : 16),
                            Text(
                              second.imageName,
                              style: TextStyle(
                                fontSize: isSmallScreen ? 24 : 32,
                                fontWeight: FontWeight.bold,
                                color: const Color(0xFF1E4147),
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Bottom response text
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 400),
                child:
                    _selected != null
                        ? Container(
                          margin: const EdgeInsets.all(16),
                          padding: const EdgeInsets.symmetric(
                            vertical: 20,
                            horizontal: 24,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(
                              0xFFFFF6D6,
                            ), // Light yellow background
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Text(
                            "I want ${_selected!.imageName}",
                            style: TextStyle(
                              fontSize: isSmallScreen ? 24 : 30,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF1E4147),
                            ),
                            textAlign: TextAlign.center,
                          ),
                        )
                        : SizedBox(height: isSmallScreen ? 50 : 70),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
