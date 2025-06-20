import 'package:flutter/material.dart';
import './lesson_base_subject_screen.dart';

class WhenQuestionsScreen extends StatelessWidget {
  static const routeName = '/when-questions';
  final Color backgroundColor;

  const WhenQuestionsScreen({super.key, required this.backgroundColor});

  @override
  Widget build(BuildContext context) {
    return LessonBaseSubjectScreen(
      title: 'When Questions',
      backgroundColor: backgroundColor,
      subject: 'when_questions',
    );
  }
}
