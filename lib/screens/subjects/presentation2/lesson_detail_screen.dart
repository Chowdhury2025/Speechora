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

class _LessonDetailScreenState extends State<LessonDetailScreen> {
  final TTSService _tts = TTSService();
  int? _speakingIndex;
  List<String> _highlightWords = [];
  int _currentWordIndex = -1;
  String? _currentDescription;
  Timer? _highlightTimer;

  void _startHighlighting(String text) {
    _highlightTimer?.cancel();
    _highlightWords = text.split(' ');
    _currentWordIndex = 0;
    int wordCount = _highlightWords.length;
    const wordDuration = Duration(milliseconds: 500);
    _tts.speak(_highlightWords[0]); // Speak the first word
    _highlightTimer = Timer.periodic(wordDuration, (timer) {
      if (_currentWordIndex < wordCount - 1) {
        setState(() {
          _currentWordIndex++;
        });
        _tts.speak(
          _highlightWords[_currentWordIndex],
        ); // Speak the highlighted word
      } else {
        timer.cancel();
        setState(() {
          _currentWordIndex = -1;
        });
      }
    });
    setState(() {
      _currentWordIndex = 0;
    });
  }

  @override
  void initState() {
    super.initState();
    // On open, play and highlight the main statement only
    final statement = widget.lesson.statement['content'];
    if (statement != null && statement is String) {
      _currentDescription = statement;
      _highlightWords = statement.split(' ');
      _currentWordIndex = 0;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _startHighlighting(statement);
      });
    }
  }

  void _handleOptionTap(Map<String, dynamic> option, int index) async {
    if (option['type'] == 'image_url' && option['description'] != null) {
      setState(() {
        _speakingIndex = index;
        _currentDescription = option['description'];
        _highlightWords = option['description'].split(' ');
        _currentWordIndex = 0;
      });
      _startHighlighting(option['description']);
    }
  }

  @override
  void dispose() {
    _tts.stop();
    _highlightTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      backgroundColor: const Color(
        0xFFB8E6E1,
      ), // Light teal background like the image
      appBar: AppBar(
        title: Text(
          widget.lesson.title,
          style: GoogleFonts.nunito(
            fontWeight: FontWeight.w900,
            fontSize: 26,
            color: Colors.white,
            letterSpacing: 0.5,
          ),
        ),
        backgroundColor: widget.backgroundColor,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight:
                  screenHeight -
                  MediaQuery.of(context).padding.top -
                  kToolbarHeight -
                  MediaQuery.of(context).padding.bottom,
            ),
            child: Column(
              children: [
                // Main content area
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      const SizedBox(height: 20),
                      // Main question at the top
                      Text(
                        _currentDescription ?? '',
                        style: GoogleFonts.nunito(
                          fontSize: screenWidth < 400 ? 32 : 38,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFF2B5A5A), // Dark teal text
                          letterSpacing: 0.5,
                          height: 1.1,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 30),
                      // Options as large cards
                      ...widget.lesson.options
                          .asMap()
                          .entries
                          .where((entry) => entry.value['type'] == 'image_url')
                          .map((entry) {
                            final index = entry.key;
                            final option = entry.value;
                            final isSpeaking = _speakingIndex == index;

                            return Padding(
                              padding: const EdgeInsets.symmetric(
                                vertical: 8.0,
                              ),
                              child: GestureDetector(
                                onTap: () => _handleOptionTap(option, index),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    // Image with rounded corners and border highlight
                                    Container(
                                      width: double.infinity,
                                      height: 180,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(20),
                                        border: Border.all(
                                          color:
                                              isSpeaking
                                                  ? const Color(0xFFFFB74D)
                                                  : Colors.transparent,
                                          width: 4,
                                        ),
                                      ),
                                      child: ClipRRect(
                                        borderRadius: BorderRadius.circular(20),
                                        child: Image.network(
                                          option['content'],
                                          width: double.infinity,
                                          height: 180,
                                          fit: BoxFit.cover,
                                          errorBuilder:
                                              (context, error, stackTrace) =>
                                                  Icon(
                                                    Icons.image,
                                                    size: 80,
                                                    color: Colors.grey,
                                                  ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    // Label below image, styled bold and centered
                                    Text(
                                      option['label'] != null
                                          ? option['label']
                                          : '',
                                      style: GoogleFonts.nunito(
                                        fontSize: screenWidth < 400 ? 22 : 28,
                                        fontWeight: FontWeight.w900,
                                        color: const Color(0xFF2B5A5A),
                                        letterSpacing: 0.5,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ],
                                ),
                              ),
                            );
                          })
                          .toList(),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
                // Answer box at the bottom
                if (_speakingIndex != null)
                  Container(
                    width: double.infinity,
                    margin: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF8DC), // Light cream color
                      borderRadius: BorderRadius.circular(32),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.08),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.symmetric(
                      vertical: 24,
                      horizontal: 16,
                    ),
                    child: Text(
                      '${widget.lesson.options[_speakingIndex!]['description'] ?? widget.lesson.options[_speakingIndex!]['label'] ?? widget.lesson.options[_speakingIndex!]['content']}',
                      style: GoogleFonts.nunito(
                        fontSize: screenWidth < 400 ? 28 : 36,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF2B5A5A),
                        letterSpacing: 0.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ImageOptionDialog extends StatefulWidget {
  final String imageUrl;
  final TTSService tts;
  const _ImageOptionDialog({required this.imageUrl, required this.tts});
  @override
  State<_ImageOptionDialog> createState() => _ImageOptionDialogState();
}

class _ImageOptionDialogState extends State<_ImageOptionDialog> {
  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Image.network(widget.imageUrl, fit: BoxFit.contain),
        IconButton(
          icon: const Icon(Icons.volume_up),
          onPressed: () => widget.tts.speak(''),
          tooltip: 'Speak Description',
        ),
      ],
    );
  }
}
