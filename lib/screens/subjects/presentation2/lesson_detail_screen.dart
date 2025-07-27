import 'package:flutter/material.dart';
import 'dart:async';
import 'package:google_fonts/google_fonts.dart';
import '../../../models/lesson_models.dart';
import '../../../services/tts_service.dart';

class LessonDetailScreen extends StatefulWidget {
  final Lesson lesson;
  final Color backgroundColor;

  const LessonDetailScreen({
    super.key,
    required this.lesson,
    required this.backgroundColor,
  });

  @override
  State<LessonDetailScreen> createState() => _LessonDetailScreenState();
}

class _LessonDetailScreenState extends State<LessonDetailScreen>
    with TickerProviderStateMixin {
  final TTSService _tts = TTSService();
  int? _selectedIndex;
  String? _selectedItem;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();

    // Setup pulse animation for selected items
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.1).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    // Auto-play the main question on load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final statement = widget.lesson.statement['content'];
      if (statement != null && statement is String) {
        _tts.speak(statement);
      }
    });
  }

  void _handleOptionTap(Map<String, dynamic> option, int index) async {
    // Stop any current TTS
    await _tts.stop();

    setState(() {
      _selectedIndex = index;
      _selectedItem = option['label'] ?? option['content'];
    });

    // Trigger pulse animation
    _pulseController.forward().then((_) {
      _pulseController.reverse();
    });

    // First speak the item name
    await _tts.speak(_selectedItem!);

    // Small delay, then speak the full sentence
    await Future.delayed(const Duration(milliseconds: 800));
    final fullSentence = "I want $_selectedItem";
    await _tts.speak(fullSentence);
  }

  @override
  void dispose() {
    _tts.stop();
    _pulseController.dispose();
    super.dispose();
  }

  Widget _buildOptionCard(Map<String, dynamic> option, int index) {
    final isSelected = _selectedIndex == index;
    final screenWidth = MediaQuery.of(context).size.width;
    final cardWidth = (screenWidth - 48) / 2; // 2 columns with padding

    // Define pastel colors for the cards
    final colors = [
      const Color(0xFFFFF8DC), // Cream (Milk)
      const Color(0xFFFFE4B5), // Peach (Juice)
      const Color(0xFFFFF0B3), // Light yellow (Cake)
      const Color(0xFFFFE1E6), // Light pink (Ice Cream)
      const Color(0xFFFFCCCC), // Light coral (Soda)
      const Color(0xFFE1F5FE), // Light blue (Water)
    ];

    final cardColor = colors[index % colors.length];

    return AnimatedBuilder(
      animation: _pulseAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: isSelected ? _pulseAnimation.value : 1.0,
          child: GestureDetector(
            onTap: () => _handleOptionTap(option, index),
            child: Container(
              width: cardWidth,
              height: 140,
              margin: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color:
                      isSelected ? const Color(0xFF4CAF50) : Colors.transparent,
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
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Image
                  Expanded(
                    flex: 3,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      child:
                          option['type'] == 'image_url'
                              ? ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.network(
                                  option['content'],
                                  fit: BoxFit.contain,
                                  errorBuilder:
                                      (context, error, stackTrace) => Icon(
                                        Icons.image,
                                        size: 40,
                                        color: Colors.grey[400],
                                      ),
                                ),
                              )
                              : Icon(
                                Icons.help_outline,
                                size: 40,
                                color: Colors.grey[400],
                              ),
                    ),
                  ),
                  // Label
                  Expanded(
                    flex: 1,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Text(
                        option['label'] ?? option['content'] ?? '',
                        style: GoogleFonts.nunito(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF2E7D7D),
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;

    // Filter options to only show image_url types
    final imageOptions =
        widget.lesson.options
            .asMap()
            .entries
            .where((entry) => entry.value['type'] == 'image_url')
            .toList();

    return Scaffold(
      backgroundColor: const Color(0xFFB5E7E1), // Light teal like the image
      appBar: AppBar(
        title: Text(
          widget.lesson.title,
          style: GoogleFonts.nunito(
            fontWeight: FontWeight.w900,
            fontSize: 22,
            color: Colors.white,
          ),
        ),
        backgroundColor: widget.backgroundColor,
        elevation: 0,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Top question section
            Expanded(
              flex: 2,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 20,
                ),
                child: Center(
                  child: Text(
                    widget.lesson.statement['content'] ?? 'What do you want?',
                    style: GoogleFonts.nunito(
                      fontSize: screenWidth < 400 ? 32 : 42,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF2E7D7D), // Dark teal
                      height: 1.2,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ),

            // Middle grid section (2x3)
            Expanded(
              flex: 5,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 1.1,
                    crossAxisSpacing: 4,
                    mainAxisSpacing: 4,
                  ),
                  itemCount: imageOptions.length,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemBuilder: (context, gridIndex) {
                    final entry = imageOptions[gridIndex];
                    return _buildOptionCard(entry.value, entry.key);
                  },
                ),
              ),
            ),

            // Bottom sentence section
            Expanded(
              flex: 1,
              child: Container(
                width: double.infinity,
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF8DC), // Light cream
                  borderRadius: BorderRadius.circular(25),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    _selectedItem != null
                        ? 'I want $_selectedItem'
                        : 'Tap an item above',
                    style: GoogleFonts.nunito(
                      fontSize: screenWidth < 400 ? 24 : 32,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF2E7D7D),
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
