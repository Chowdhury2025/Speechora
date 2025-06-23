import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class OthersScreen extends StatelessWidget {
  static const routeName = '/others';
  final Color backgroundColor;

  const OthersScreen({super.key, required this.backgroundColor});

  @override
  Widget build(BuildContext context) {
    return BaseSubjectScreen(
      title: 'Others',
      backgroundColor: backgroundColor,
      category: 'others',
    );
  }
}
