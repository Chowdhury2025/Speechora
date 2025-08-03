import 'package:flutter/material.dart';
import '../../../models/lesson_models.dart';
import '../../../services/lesson_service.dart';
import 'lesson_detail_screen.dart';

class PresentationTwo extends StatefulWidget {
  final String title;
  final Color backgroundColor;
  final String subject;

  const PresentationTwo({
    super.key,
    required this.title,
    required this.backgroundColor,
    required this.subject,
    required String question,
    required String response,
  });

  @override
  State<PresentationTwo> createState() => _PresentationTwoState();
}

class _PresentationTwoState extends State<PresentationTwo> {
  bool isLoading = false;
  List<Lesson> lessons = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: widget.backgroundColor,
      ),
      body: FutureBuilder<List<Lesson>>(
        future: LessonService.getLessonsBySubject(widget.subject),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          lessons = snapshot.data ?? [];
          if (lessons.isEmpty) {
            return const Center(child: Text('No lessons available'));
          }

          return RefreshIndicator(
            onRefresh: () async {
              setState(() {
                isLoading = true;
              });
              final newLessons = await LessonService.getLessonsBySubject(
                widget.subject,
              );
              if (mounted) {
                setState(() {
                  lessons = newLessons;
                  isLoading = false;
                });
              }
            },
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 1,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              itemCount: lessons.length,
              itemBuilder: (context, index) {
                final lesson = lessons[index];
                return GestureDetector(
                  onTap:
                      () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder:
                              (_) => LessonDetailScreen(
                                lesson: lesson,
                                backgroundColor: widget.backgroundColor,
                              ),
                          settings: RouteSettings(
                            arguments: {
                              'lessonsList': lessons,
                              'currentIndex': index,
                            },
                          ),
                        ),
                      ),
                  child: Card(
                    elevation: 8,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          Container(
                            color: widget.backgroundColor.withOpacity(0.1),
                            child: Icon(
                              Icons.menu_book,
                              size: 48,
                              color: widget.backgroundColor.withOpacity(0.3),
                            ),
                          ),
                          Positioned(
                            bottom: 0,
                            left: 0,
                            right: 0,
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.bottomCenter,
                                  end: Alignment.topCenter,
                                  colors: [
                                    Colors.black.withOpacity(0.8),
                                    Colors.black.withOpacity(0.4),
                                    Colors.transparent,
                                  ],
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    lesson.title,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  if (lesson.description != null &&
                                      lesson.description!.isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 4),
                                      child: Text(
                                        lesson.description!,
                                        style: const TextStyle(
                                          color: Colors.white70,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
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
              },
            ),
          );
        },
      ),
    );
  }
}
