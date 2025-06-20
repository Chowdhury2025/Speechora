import 'package:flutter/material.dart';
import './lesson_base_subject_screen.dart';

class WhereQuestionsScreen extends StatelessWidget {
  static const routeName = '/where-questions';
  final Color backgroundColor;

  const WhereQuestionsScreen({super.key, required this.backgroundColor});

  @override
  Widget build(BuildContext context) {
    return LessonBaseSubjectScreen(
      title: 'Where Questions',
      backgroundColor: backgroundColor,
      subject: 'where_questions',
    );
  }
}
