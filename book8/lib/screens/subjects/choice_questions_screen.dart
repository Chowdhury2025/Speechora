import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class ChoiceQuestionsScreen extends StatelessWidget {
  static const routeName = '/choice-questions';
  final Color backgroundColor;

  const ChoiceQuestionsScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return BaseSubjectScreen(
      title: 'Choice Questions',
      backgroundColor: backgroundColor,
      category: 'choice_questions',
    );
  }
}
