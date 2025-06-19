import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class WantsAndNeedsScreen extends StatelessWidget {
  static const routeName = '/wants_and_needs';
  final Color backgroundColor;

  const WantsAndNeedsScreen({super.key, required this.backgroundColor});

  @override
  Widget build(BuildContext context) {
    return BaseSubjectScreen(
      title: 'I Want / Needs',
      backgroundColor: backgroundColor,
      category: 'i_want_needs',
    );
  }
}
