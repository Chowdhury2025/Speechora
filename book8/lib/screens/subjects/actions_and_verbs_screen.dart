import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class ActionsAndVerbsScreen extends StatelessWidget {
  static const routeName = '/actions-and-verbs';
  final Color backgroundColor;

  const ActionsAndVerbsScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return BaseSubjectScreen(
      title: 'Actions / Verbs',
      backgroundColor: backgroundColor,
      category: 'actions_and_verbs',
    );
  }
}
