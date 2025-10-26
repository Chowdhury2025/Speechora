import 'package:flutter/material.dart';
import 'dart:async';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
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
  late AnimationController _successController;
  late Animation<double> _pulseAnimation;
  List<Lesson>? lessonsList;
  int? currentIndex;
  bool showSuccess = false;

  @override
  void initState() {
    super.initState();

    // Setup pulse animation for selected items
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _successController = AnimationController(vsync: this);
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.1).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  void _handleOptionTap(Map<String, dynamic> option, int index) async {
    // Stop any current TTS
    await _tts.stop();

    String ttsText = (option['label'] ?? option['description']) ?? '';
    if (ttsText.isEmpty) {
      // Only use content if it's not a URL
      final content = option['content'] ?? '';
      if (content is String &&
          !(content.startsWith('http://') || content.startsWith('https://'))) {
        ttsText = content;
      } else {
        ttsText = 'Selected item';
      }
    }

    setState(() {
      _selectedIndex = index;
      _selectedItem = ttsText;
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

    // Wait 3 seconds after content is fully read
    await Future.delayed(const Duration(seconds: 3));

    // Check if we're at the last lesson
    if (lessonsList != null &&
        currentIndex != null &&
        currentIndex == lessonsList!.length - 1) {
      // Show success animation
      setState(() => showSuccess = true);
      await Future.delayed(const Duration(seconds: 5));
      setState(() => showSuccess = false);
      Navigator.of(context).pop(); // Return to grid after completion
    } else if (lessonsList != null && currentIndex != null) {
      // Go to next lesson automatically
      if (!mounted) return; // Check if widget is still mounted

      // Ensure TTS is stopped before navigation
      await _tts.stop();

      // Create next screen data
      final nextIndex = currentIndex! + 1;
      final nextLesson = lessonsList![nextIndex];

      if (mounted) {
        // Check again before navigation
        await Navigator.pushReplacement(
          context,
          PageRouteBuilder(
            pageBuilder:
                (context, animation1, animation2) => LessonDetailScreen(
                  lesson: nextLesson,
                  backgroundColor: widget.backgroundColor,
                ),
            settings: RouteSettings(
              arguments: {
                'lessonsList': lessonsList,
                'currentIndex': nextIndex,
              },
            ),
            transitionDuration: Duration.zero,
            reverseTransitionDuration: Duration.zero,
          ),
        );
      }
    }
  }

  bool _hasStartedReading = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_hasStartedReading) {
      if (ModalRoute.of(context)?.settings.arguments is Map) {
        final args = ModalRoute.of(context)!.settings.arguments as Map;
        lessonsList = args['lessonsList'] as List<Lesson>?;
        currentIndex = args['currentIndex'] as int?;
      }
      _hasStartedReading = true;
      // Use Future.microtask to ensure we're fully mounted before starting
      Future.microtask(() {
        final statement = widget.lesson.statement['content'];
        if (statement != null && statement is String) {
          _tts.speak(statement);
        }
      });
    }
  }

  @override
  void dispose() {
    _tts.stop();
    _pulseController.dispose();
    _successController.dispose();
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

    // Never show image URL as label
    String labelText = option['label'] ?? option['description'] ?? '';
    // If label is empty and content is a URL, don't show it
    if (labelText.isEmpty &&
        option['content'] is String &&
        (option['content'].startsWith('http://') ||
            option['content'].startsWith('https://'))) {
      labelText = '';
    } else if (labelText.isEmpty) {
      labelText = option['content'] ?? '';
    }

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
                      // Apply margin, padding and shadow to the image container
                      margin: const EdgeInsets.symmetric(horizontal: 12),
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black12,
                            blurRadius: 8,
                            offset: Offset(0, 4),
                          ),
                        ],
                      ),
                      // Clip the child so the image respects the borderRadius
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child:
                            option['type'] == 'image_url'
                                ? (option['content'] != null
                                    ? Image.network(
                                      option['content'],
                                      fit: BoxFit.cover,
                                      width: double.infinity,
                                      height: double.infinity,
                                      loadingBuilder: (
                                        context,
                                        child,
                                        loadingProgress,
                                      ) {
                                        if (loadingProgress == null)
                                          return child;
                                        return Center(
                                          child: CircularProgressIndicator(
                                            value:
                                                loadingProgress
                                                            .expectedTotalBytes !=
                                                        null
                                                    ? loadingProgress
                                                            .cumulativeBytesLoaded /
                                                        loadingProgress
                                                            .expectedTotalBytes!
                                                    : null,
                                          ),
                                        );
                                      },
                                      errorBuilder:
                                          (context, error, stackTrace) =>
                                              Container(
                                                color: Colors.grey[200],
                                                child: Column(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment.center,
                                                  children: [
                                                    Icon(
                                                      Icons.image_not_supported,
                                                      size: 40,
                                                      color: Colors.grey[400],
                                                    ),
                                                    const SizedBox(height: 4),
                                                    Text(
                                                      'Image not found',
                                                      style: TextStyle(
                                                        fontSize: 12,
                                                        color: Colors.grey[600],
                                                      ),
                                                      textAlign:
                                                          TextAlign.center,
                                                    ),
                                                  ],
                                                ),
                                              ),
                                    )
                                    : Icon(
                                      Icons.image_not_supported,
                                      size: 40,
                                      color: Colors.grey[400],
                                    ))
                                : Icon(
                                  Icons.help_outline,
                                  size: 40,
                                  color: Colors.grey[400],
                                ),
                      ),
                    ),
                  ),
                  // Label
                  Expanded(
                    flex: 1,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Text(
                        labelText,
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
      body: Stack(
        children: [
          SafeArea(
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
                        widget.lesson.statement['content'] ??
                            'What do you want?',
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
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
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
          if (showSuccess)
            Container(
              color: Colors.black.withOpacity(0.7),
              child: Center(
                child: SizedBox(
                  width: 300,
                  height: 300,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Lottie.asset(
                            'assets/animations/completed_a_task.json',
                            controller: _successController,
                            onLoaded: (composition) {
                              _successController.duration =
                                  composition.duration;
                              _successController.forward();
                            },
                            fit: BoxFit.contain,
                          ),
                        ),
                      ),
                      const Text(
                        'Task Completed!',
                        style: TextStyle(
                          fontSize: 32,
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
