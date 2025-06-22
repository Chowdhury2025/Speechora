import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../services/lesson_service.dart';
import '../../../services/tts_service.dart';

class LessonBaseSubjectScreen extends StatefulWidget {
  final String title;
  final Color backgroundColor;
  final String subject;

  const LessonBaseSubjectScreen({
    super.key,
    required this.title,
    required this.backgroundColor,
    required this.subject,
  });

  @override
  State<LessonBaseSubjectScreen> createState() =>
      _LessonBaseSubjectScreenState();
}

class _LessonBaseSubjectScreenState extends State<LessonBaseSubjectScreen> {
  bool isLoading = false;
  String? error;
  List<Lesson> lessons = [];
  late final TTSService _tts;
  int currentLessonIndex = 0;
  LessonContent? selectedOption;
  bool isShowingLessonList = true; // Show lesson list initially

  @override
  void initState() {
    super.initState();
    _tts = TTSService();
    _loadLessons();
  }

  Future<void> _loadLessons() async {
    if (mounted) {
      setState(() {
        isLoading = true;
        error = null;
      });
    }

    try {
      final response = await LessonService.getLessonsBySubject(widget.subject);
      if (mounted) {
        setState(() {
          lessons = response;
          isLoading = false;
        });
        // Read the statement aloud when lessons are loaded
        if (lessons.isNotEmpty) {
          await _tts.speak(lessons[0].statement.text);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          error = e.toString();
          isLoading = false;
        });
      }
    }
  }

  void _handleOptionSelected(
    BuildContext context,
    Lesson lesson,
    LessonContent option,
  ) async {
    setState(() {
      selectedOption = option;
    });

    // When an option is selected, read both statement and option text as one sentence
    final textToSpeak = '${lesson.statement.text}. ${option.text}';
    await _tts.speak(textToSpeak);

    // If there's an image, show it in a dialog
    if (option.imageUrl != null) {
      if (!context.mounted) return;
      showDialog(
        context: context,
        builder:
            (context) => Dialog(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CachedNetworkImage(
                    imageUrl: option.imageUrl!,
                    fit: BoxFit.contain,
                    placeholder:
                        (context, url) =>
                            const Center(child: CircularProgressIndicator()),
                    errorWidget:
                        (context, url, error) => const Icon(Icons.error),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Close'),
                  ),
                ],
              ),
            ),
      );
    }
  }

  Widget _buildOptionCard(
    BuildContext context,
    Lesson lesson,
    LessonContent option,
    int index,
  ) {
    final colors = [
      const Color(0xFFFFF4B7), // Pale yellow
      const Color(0xFFFFE4D6), // Pale orange
      const Color(0xFFFFD4D4), // Pale red
      const Color(0xFFE0F4F4), // Pale cyan
    ];

    return Container(
      decoration: BoxDecoration(
        color: colors[index % colors.length],
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => _handleOptionSelected(context, lesson, option),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (option.imageUrl != null)
              Expanded(
                flex: 3,
                child: CachedNetworkImage(
                  imageUrl: option.imageUrl!,
                  fit: BoxFit.cover,
                  placeholder:
                      (context, url) => Container(
                        color: Colors.grey.withOpacity(0.1),
                        child: const Center(
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      ),
                  errorWidget:
                      (context, url, error) => Container(
                        color: Colors.grey.withOpacity(0.1),
                        child: const Icon(Icons.image_not_supported),
                      ),
                ),
              ),
            Expanded(
              flex: 2,
              child: Container(
                padding: const EdgeInsets.all(8.0),
                child: Text(
                  option.text,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _selectLesson(int index) async {
    if (index >= 0 && index < lessons.length) {
      setState(() {
        currentLessonIndex = index;
        selectedOption = null;
        isShowingLessonList = false;
      });
      // Play the new lesson's statement
      await _tts.speak(lessons[index].statement.text);
    }
  }

  Widget _buildLessonList() {
    return Container(
      height: MediaQuery.of(context).size.height * 0.5,
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
    );
  }

  void _toggleLessonList() {
    setState(() {
      isShowingLessonList = !isShowingLessonList;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: Text(widget.title),
          backgroundColor: widget.backgroundColor,
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (error != null) {
      return Scaffold(
        appBar: AppBar(
          title: Text(widget.title),
          backgroundColor: widget.backgroundColor,
        ),
        body: Center(child: Text('Error: $error')),
      );
    }

    if (lessons.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          title: Text(widget.title),
          backgroundColor: widget.backgroundColor,
        ),
        body: const Center(child: Text('No lessons available')),
      );
    } // Get the currently selected lesson
    final activeLesson = lessons[currentLessonIndex];

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: widget.backgroundColor,
        elevation: 0,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Big statement/question at the top
          Container(
            padding: const EdgeInsets.all(24.0),
            color: widget.backgroundColor.withOpacity(0.1),
            child: Text(
              activeLesson.statement.text,
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Color(0xFF2C5F5F),
              ),
              textAlign: TextAlign.center,
            ),
          ),
          // Options grid
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.85,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              itemCount: activeLesson.options.length,
              itemBuilder:
                  (context, index) => _buildOptionCard(
                    context,
                    activeLesson,
                    activeLesson.options[index],
                    index,
                  ),
            ),
          ),
          // Selected option description at the bottom          if (selectedOption != null)
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '${activeLesson.statement.text}. ${selectedOption!.text}',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2C5F5F),
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _toggleLessonList,
        backgroundColor: widget.backgroundColor,
        child: Icon(
          isShowingLessonList ? Icons.close : Icons.list,
          color: Colors.white,
        ),
      ),
      bottomSheet: isShowingLessonList ? _buildLessonList() : null,
    );
  }

  @override
  void dispose() {
    _tts.stop();
    super.dispose();
  }
}
