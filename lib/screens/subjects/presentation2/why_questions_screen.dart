import 'package:flutter/material.dart';
import './lesson_base_subject_screen.dart';

class WhyQuestionsScreen extends StatelessWidget {
  static const routeName = '/why-questions';
  final Color backgroundColor;

  const WhyQuestionsScreen({
    super.key,
    this.backgroundColor = const Color(0xFFB2DFDB), // Default background color
  });

  @override
  Widget build(BuildContext context) {
    return LessonBaseSubjectScreen(
      title: 'Why Questions',
      backgroundColor: backgroundColor,
      subject: 'why_questions',
    );
  }
}
