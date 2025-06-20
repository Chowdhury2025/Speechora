import 'package:flutter/material.dart';
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
  final TTSService _tts = TTSService();
  Lesson? selectedLesson;

  @override
  void initState() {
    super.initState();
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
    Map<String, dynamic> option,
  ) async {
    // Read aloud if the content is text
    if (option['type'] == 'text') {
      await _tts.speak(option['content']);
    }
    // Handle image or video display
    else if (option['type'] == 'image_url') {
      // Show image in a dialog
      showDialog(
        context: context,
        builder:
            (context) => Dialog(
              child: Image.network(option['content'], fit: BoxFit.contain),
            ),
      );
    } else if (option['type'] == 'video_url') {
      // Navigate to video player screen
      // You'll need to implement video player navigation here
    }
  }

  void _openLesson(BuildContext context, Lesson lesson) async {
    // Read the title aloud
    await _tts.speak(lesson.title);

    // Show the lesson content in a bottom sheet
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder:
          (context) => DraggableScrollableSheet(
            initialChildSize: 0.9,
            minChildSize: 0.5,
            maxChildSize: 0.9,
            expand: false,
            builder:
                (context, scrollController) => SingleChildScrollView(
                  controller: scrollController,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          lesson.title,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (lesson.description != null) ...[
                          const SizedBox(height: 8),
                          Text(
                            lesson.description!,
                            style: const TextStyle(fontSize: 16),
                          ),
                        ],
                        const SizedBox(height: 16),
                        // Display statement
                        _buildContentWidget(
                          lesson.statement,
                          isStatement: true,
                        ),
                        const SizedBox(height: 24),
                        // Display options in a grid
                        GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                childAspectRatio: 1,
                                crossAxisSpacing: 16,
                                mainAxisSpacing: 16,
                              ),
                          itemCount: (lesson.options as List).length,
                          itemBuilder: (context, index) {
                            final option = (lesson.options as List)[index];
                            return Card(
                              elevation: 4,
                              child: InkWell(
                                onTap:
                                    () =>
                                        _handleOptionSelected(context, option),
                                child: _buildContentWidget(option),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),
          ),
    );

    setState(() {
      selectedLesson = lesson;
    });
  }

  Widget _buildContentWidget(
    Map<String, dynamic> content, {
    bool isStatement = false,
  }) {
    switch (content['type']) {
      case 'text':
        return Padding(
          padding: const EdgeInsets.all(8.0),
          child: Text(
            content['content'],
            style: TextStyle(
              fontSize: isStatement ? 20 : 16,
              fontWeight: isStatement ? FontWeight.bold : FontWeight.normal,
            ),
            textAlign: TextAlign.center,
          ),
        );
      case 'image_url':
        return Image.network(
          content['content'],
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            return Container(
              color: Colors.grey[200],
              child: const Icon(Icons.image_not_supported, size: 50),
            );
          },
        );
      case 'video_url':
        return Container(
          color: Colors.grey[200],
          child: const Icon(Icons.play_circle_outline, size: 50),
        );
      default:
        return const SizedBox.shrink();
    }
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

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: widget.backgroundColor,
      ),
      body:
          lessons.isEmpty
              ? Center(
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
              )
              : GridView.builder(
                padding: const EdgeInsets.all(16),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 1.2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                ),
                itemCount: lessons.length,
                itemBuilder: (context, index) {
                  final lesson = lessons[index];
                  return Card(
                    elevation: 4,
                    child: InkWell(
                      onTap: () => _openLesson(context, lesson),
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.school,
                              size: 48,
                              color: widget.backgroundColor,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              lesson.title,
                              textAlign: TextAlign.center,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
    );
  }

  @override
  void dispose() {
    _tts.stop();
    super.dispose();
  }
}
