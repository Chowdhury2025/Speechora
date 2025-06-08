import 'package:flutter/material.dart';
import 'package:book8/screens/subjects/base_subject_screen.dart';

class ActivitiesScreen extends StatelessWidget {
  static const routeName = '/activities';
  final Color backgroundColor;

  const ActivitiesScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return BaseSubjectScreen(
      title: 'Activities',
      backgroundColor: backgroundColor,
      category: 'activities',
    );
  }
}
