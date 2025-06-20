import 'package:flutter/material.dart';
import './lesson_base_subject_screen.dart';

class WhatQuestionsScreen extends StatelessWidget {
  static const routeName = '/what-questions';
  final Color backgroundColor;

  const WhatQuestionsScreen({super.key, required this.backgroundColor});

  @override
  Widget build(BuildContext context) {
    return LessonBaseSubjectScreen(
      title: 'What Questions',
      backgroundColor: backgroundColor,
      subject: 'what_questions',
    );
  }
}
