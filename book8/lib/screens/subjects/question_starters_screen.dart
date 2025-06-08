import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class QuestionStartersScreen extends StatelessWidget {
  static const routeName = '/question-starters';
  final Color backgroundColor;

  const QuestionStartersScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return BaseSubjectScreen(
      title: 'Question Starters',
      backgroundColor: backgroundColor,
      category: 'question_starters',
    );
  }
}
