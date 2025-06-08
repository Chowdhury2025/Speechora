import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class WhereQuestionsScreen extends StatelessWidget {
  static const routeName = '/where-questions';
  final Color backgroundColor;

  const WhereQuestionsScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return BaseSubjectScreen(
      title: 'Where Questions',
      backgroundColor: backgroundColor,
      category: 'where_questions',
    );
  }
}
