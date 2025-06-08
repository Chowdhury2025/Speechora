import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class WantsAndNeedsScreen extends StatelessWidget {
  static const routeName = '/wants-and-needs';
  final Color backgroundColor;

  const WantsAndNeedsScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return BaseSubjectScreen(
      title: 'I Want / Needs',
      backgroundColor: backgroundColor,
      category: 'wants_and_needs',
    );
  }
}
