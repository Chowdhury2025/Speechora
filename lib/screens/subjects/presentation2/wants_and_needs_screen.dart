import 'package:flutter/material.dart';
import 'lesson_base_subject_screen.dart';

class WantsAndNeedsScreen extends StatelessWidget {
  static const routeName = '/wants_and_needs';
  final Color backgroundColor;

  const WantsAndNeedsScreen({super.key, required this.backgroundColor});

  @override
  Widget build(BuildContext context) {
    return LessonBaseSubjectScreen(
      title: 'Wants and Needs Expression',
      backgroundColor: backgroundColor,
      subject: 'wants_and_needs_expression',
    );
  }
}
