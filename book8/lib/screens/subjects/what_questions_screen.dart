import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class WhatQuestionsScreen extends StatelessWidget {
  static const routeName = '/what-questions';
  final Color backgroundColor;

  const WhatQuestionsScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return BaseSubjectScreen(
      title: 'What Questions',
      backgroundColor: backgroundColor,
      category: 'what_questions',
    );
  }
}
