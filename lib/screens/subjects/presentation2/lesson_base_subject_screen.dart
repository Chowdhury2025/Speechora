import 'package:flutter/material.dart';
import '../../../models/lesson_models.dart';
import '../../../services/lesson_service.dart';
import 'lesson_detail_screen.dart';

class PresentationTwo extends StatelessWidget {
  final String title;
  final Color backgroundColor;
  final String subject;

  const PresentationTwo({
    super.key,
    required this.title,
    required this.backgroundColor,
    required this.subject,
  });
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title), backgroundColor: backgroundColor),
      body: FutureBuilder<List<Lesson>>(
        future: LessonService.getLessonsBySubject(subject),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final lessons = snapshot.data ?? [];
          if (lessons.isEmpty) {
            return const Center(child: Text('No lessons available SS'));
          }

          return ListView.builder(
            itemCount: lessons.length,
            itemBuilder: (context, index) {
              final lesson = lessons[index];
              return Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
                child: InkWell(
                  borderRadius: BorderRadius.circular(18),
                  onTap:
                      () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder:
                              (_) => LessonDetailScreen(
                                lesson: lesson,
                                backgroundColor: backgroundColor,
                              ),
                        ),
                      ),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: backgroundColor.withOpacity(0.18),
                          blurRadius: 12,
                          offset: const Offset(0, 6),
                        ),
                      ],
                      border: Border.all(
                        color: backgroundColor.withOpacity(0.18),
                        width: 1.5,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          margin: const EdgeInsets.all(14),
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: backgroundColor.withOpacity(0.15),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.menu_book,
                            color: backgroundColor,
                            size: 28,
                          ),
                        ),
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              vertical: 18,
                              horizontal: 0,
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  lesson.title,
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 18,
                                    color: backgroundColor,
                                  ),
                                ),
                                if (lesson.description != null &&
                                    lesson.description!.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 4.0),
                                    child: Text(
                                      lesson.description!,
                                      style: const TextStyle(
                                        fontSize: 14,
                                        color: Colors.black54,
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(right: 16.0),
                          child: Icon(
                            Icons.arrow_forward_ios,
                            color: backgroundColor,
                            size: 22,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
