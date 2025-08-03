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

  Widget _buildOptionCard(QuizItem item) {
    final isSelected = item == _selected;
    return GestureDetector(
      onTap: () => _onSelect(item),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        width: double.infinity,
        margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 24),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color:
              isSelected ? Colors.orangeAccent.withOpacity(0.7) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color:
                  isSelected ? Colors.orange.withOpacity(0.5) : Colors.black12,
              blurRadius: isSelected ? 12 : 4,
              spreadRadius: isSelected ? 2 : 0,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Hero(
              tag: 'image_${item.imageName}',
              child: Container(
                width: double.infinity,
                height: 200, // Increased height for better visibility
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 4,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    item.imageUrl,
                    fit: BoxFit.cover, // Changed to cover for full coverage
                    width: double.infinity,
                    height: double.infinity,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return Center(
                        child: CircularProgressIndicator(
                          value:
                              loadingProgress.expectedTotalBytes != null
                                  ? loadingProgress.cumulativeBytesLoaded /
                                      loadingProgress.expectedTotalBytes!
                                  : null,
                        ),
                      );
                    },
                    errorBuilder:
                        (context, error, stackTrace) => Container(
                          color: Colors.grey[200],
                          child: Icon(
                            Icons.error_outline,
                            size: 40,
                            color: Colors.red[300],
                          ),
                        ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              item.imageName,
              style: TextStyle(
                fontSize: 24,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                color: Colors.teal[800],
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

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

    return Scaffold(
      backgroundColor: const Color(0xFFE0F7FA),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 40),
            // Question text with animation
            ScaleTransition(
              scale: _questionAnimation,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Text(
                  "Do you want ${first.imageName} or ${second.imageName}?",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.teal[700],
                    height: 1.2,
                    shadows: [
                      Shadow(
                        offset: const Offset(0, 1),
                        blurRadius: 2,
                        color: Colors.black.withOpacity(0.2),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 40),
            // Two option cards with Expanded to take equal space
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildOptionCard(first),
                    const SizedBox(height: 16),
                    _buildOptionCard(second),
                  ],
                ),
              ),
            ),
            // Bottom sentence with animation
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child:
                  _selected != null
                      ? Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.yellow[100],
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 4,
                              offset: const Offset(0, -2),
                            ),
                          ],
                        ),
                        padding: const EdgeInsets.symmetric(
                          vertical: 24,
                          horizontal: 16,
                        ),
                        child: Text(
                          "I want ${_selected!.imageName}",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w600,
                            color: Colors.teal[800],
                            letterSpacing: 0.5,
                          ),
                        ),
                      )
                      : const SizedBox(height: 76),
            ),
          ],
        ),
      ),
    );
  }
}
