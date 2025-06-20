import 'package:flutter/material.dart';
import './lesson_base_subject_screen.dart';

class WhoQuestionsScreen extends StatelessWidget {
  static const routeName = '/who-questions';
  final Color backgroundColor;

  const WhoQuestionsScreen({super.key, required this.backgroundColor});

  @override
  Widget build(BuildContext context) {
    return LessonBaseSubjectScreen(
      title: 'Who Questions',
      backgroundColor: backgroundColor,
      subject: 'who_questions',
    );
  }
}
