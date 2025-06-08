import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class WhoQuestionsScreen extends StatelessWidget {
  static const routeName = '/who-questions';
  final Color backgroundColor;

  const WhoQuestionsScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return BaseSubjectScreen(
      title: 'Who Questions',
      backgroundColor: backgroundColor,
      category: 'who_questions',
    );
  }
}
