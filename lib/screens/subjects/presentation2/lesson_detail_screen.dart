import 'package:flutter/material.dart';
import 'dart:async';
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
    return Scaffold(
      backgroundColor: const Color(0xFFE6F3F7),
      appBar: AppBar(
        title: Text(widget.lesson.title),
        backgroundColor: widget.backgroundColor,
        elevation: 0,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 24),
          // Highlighted statement at the top
          if (_currentDescription != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Wrap(
                alignment: WrapAlignment.center,
                children: List.generate(_highlightWords.length, (i) {
                  return Text(
                    _highlightWords[i] + ' ',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                      color:
                          i == _currentWordIndex
                              ? Colors.orange
                              : const Color(0xFF2B4A5A),
                      backgroundColor:
                          i == _currentWordIndex
                              ? Colors.yellow[200]
                              : Colors.transparent,
                    ),
                  );
                }),
              ),
            ),
          const SizedBox(height: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: GridView.builder(
                itemCount: widget.lesson.options.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.95,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                ),
                itemBuilder: (context, index) {
                  final option = widget.lesson.options[index];
                  if (option['type'] != 'image_url')
                    return const SizedBox.shrink();
                  final isSpeaking = _speakingIndex == index;
                  // Pick a pastel color for each card (cycle through a palette)
                  final pastelColors = [
                    const Color(0xFFFFF3D6), // light yellow
                    const Color(0xFFFFE0D6), // light orange
                    const Color(0xFFD6F3FF), // light blue
                    const Color(0xFFD6FFE0), // light green
                    const Color(0xFFFFD6F3), // light pink
                    const Color(0xFFE0D6FF), // light purple
                  ];
                  final bgColor = pastelColors[index % pastelColors.length];
                  return GestureDetector(
                    onTap: () => _handleOptionTap(option, index),
                    child: Container(
                      decoration: BoxDecoration(
                        color: bgColor,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color:
                              isSpeaking
                                  ? const Color(0xFFFFB74D)
                                  : Colors.transparent,
                          width: 3,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black12,
                            blurRadius: 6,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      margin: const EdgeInsets.all(2),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Image.network(
                            option['content'],
                            height: 70,
                            width: 70,
                            fit: BoxFit.contain,
                            errorBuilder:
                                (context, error, stackTrace) => const Icon(
                                  Icons.image,
                                  size: 60,
                                  color: Colors.grey,
                                ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            option['description'] ??
                                option['label'] ??
                                option['content'],
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF2B4A5A),
                              letterSpacing: 0.5,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
          // Answer box at the bottom
          if (_speakingIndex != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF3D6),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 8,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                padding: const EdgeInsets.symmetric(vertical: 22),
                child: Center(
                  child: Text(
                    '${widget.lesson.options[_speakingIndex!]['description'] ?? widget.lesson.options[_speakingIndex!]['label'] ?? widget.lesson.options[_speakingIndex!]['content']}',
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF2B4A5A),
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
            ),
        ],
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
