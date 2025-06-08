import 'package:flutter/material.dart';
import 'package:book8/screens/subjects/base_subject_screen.dart';

class TherapyScreen extends StatelessWidget {
  static const routeName = '/therapy';
  final Color backgroundColor;

  const TherapyScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return BaseSubjectScreen(
      title: 'Therapy',
      backgroundColor: backgroundColor,
      category: 'therapy',
    );
  }
}
