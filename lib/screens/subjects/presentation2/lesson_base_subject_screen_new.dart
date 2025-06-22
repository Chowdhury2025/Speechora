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
  String? selectedText;

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
          if (response.isNotEmpty) {
            _tts.speak(response[0].statement.text);
          }
        });
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
    final textToSpeak = '${lesson.statement.text}: ${option.text}';
    await _tts.speak(textToSpeak);

    setState(() {
      selectedText = option.text;
    });

    if (option.imageUrl != null) {
      if (!mounted) return;
      showDialog(
        context: context,
        builder:
            (context) => Dialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(20),
                    ),
                    child: CachedNetworkImage(
                      imageUrl: option.imageUrl!,
                      fit: BoxFit.cover,
                      placeholder:
                          (context, url) => const Padding(
                            padding: EdgeInsets.all(20.0),
                            child: CircularProgressIndicator(),
                          ),
                      errorWidget:
                          (context, url, error) =>
                              const Icon(Icons.error_outline),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(
                      option.text,
                      style: const TextStyle(fontSize: 16),
                      textAlign: TextAlign.center,
                    ),
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

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        backgroundColor: const Color(0xFFE0F4F4),
        appBar: AppBar(
          title: Text(widget.title),
          backgroundColor: widget.backgroundColor,
          elevation: 0,
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (error != null) {
      return Scaffold(
        backgroundColor: const Color(0xFFE0F4F4),
        appBar: AppBar(
          title: Text(widget.title),
          backgroundColor: widget.backgroundColor,
          elevation: 0,
        ),
        body: Center(child: Text('Error: $error')),
      );
    }

    if (lessons.isEmpty) {
      return Scaffold(
        backgroundColor: const Color(0xFFE0F4F4),
        appBar: AppBar(
          title: Text(widget.title),
          backgroundColor: widget.backgroundColor,
          elevation: 0,
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.school,
                size: 64,
                color: widget.backgroundColor.withOpacity(0.5),
              ),
              const SizedBox(height: 16),
              Text(
                'No lessons available',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: widget.backgroundColor.withOpacity(0.7),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Check back later for new content',
                style: TextStyle(fontSize: 16, color: Colors.grey[600]),
              ),
            ],
          ),
        ),
      );
    }

    final activeLesson = lessons[0];

    return Scaffold(
      backgroundColor: const Color(0xFFE0F4F4),
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: widget.backgroundColor,
        elevation: 0,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        activeLesson.statement.text,
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF2C5F5F),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              childAspectRatio: 1.0,
                              crossAxisSpacing: 16,
                              mainAxisSpacing: 16,
                            ),
                        itemCount: activeLesson.options.length,
                        itemBuilder: (context, index) {
                          final option = activeLesson.options[index];
                          final colors = [
                            const Color(0xFFFFF4B7), // Pale yellow
                            const Color(0xFFFFE4D6), // Pale orange
                            const Color(0xFFFFD4D4), // Pale red
                            const Color(0xFFE0F4F4), // Pale cyan
                          ];
                          return InkWell(
                            onTap:
                                () => _handleOptionSelected(
                                  context,
                                  activeLesson,
                                  option,
                                ),
                            child: Container(
                              decoration: BoxDecoration(
                                color: colors[index % colors.length],
                                borderRadius: BorderRadius.circular(20),
                              ),
                              clipBehavior: Clip.antiAlias,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  if (option.imageUrl != null)
                                    Expanded(
                                      child: CachedNetworkImage(
                                        imageUrl: option.imageUrl!,
                                        fit: BoxFit.cover,
                                        width: double.infinity,
                                        placeholder:
                                            (context, url) => Container(
                                              color: Colors.grey.withOpacity(
                                                0.1,
                                              ),
                                              child: const Center(
                                                child:
                                                    CircularProgressIndicator(
                                                      strokeWidth: 2,
                                                    ),
                                              ),
                                            ),
                                        errorWidget:
                                            (context, url, error) => Container(
                                              color: Colors.grey.withOpacity(
                                                0.1,
                                              ),
                                              child: const Center(
                                                child: Icon(
                                                  Icons.error_outline,
                                                ),
                                              ),
                                            ),
                                      ),
                                    ),
                                  Padding(
                                    padding: const EdgeInsets.all(12.0),
                                    child: Text(
                                      option.text,
                                      style: const TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF2C5F5F),
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
            if (selectedText != null)
              Container(
                width: double.infinity,
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  selectedText!,
                  style: const TextStyle(
                    fontSize: 20,
                    color: Color(0xFF2C5F5F),
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _tts.stop();
    super.dispose();
  }
}
