import 'package:flutter/material.dart';
import 'package:book8/screens/subjects/base_subject_screen.dart';

class SchoolScreen extends StatelessWidget {
  static const routeName = '/school';
  final Color backgroundColor;

  const SchoolScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return BaseSubjectScreen(
      title: 'School',
      backgroundColor: backgroundColor,
      category: 'school',
    );
  }
}
