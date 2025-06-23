import 'package:flutter/material.dart';
import '../../../models/lesson_models.dart';
import '../../../services/lesson_service.dart';
import 'lesson_detail_screen.dart';

class LessonBaseSubjectScreen extends StatelessWidget {
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
              return ListTile(
                title: Text(lesson.title),
                subtitle: Text('Age: ${lesson.ageGroup}'),
                trailing: const Icon(Icons.arrow_forward_ios),
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
              );
            },
          );
        },
      ),
    );
  }
}
