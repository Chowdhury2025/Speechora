import 'package:flutter/material.dart';
import 'package:book8/screens/subjects/base_subject_screen.dart';

class HomeScreen extends StatelessWidget {
  static const routeName = '/home';
  final Color backgroundColor;

  const HomeScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return BaseSubjectScreen(
      title: 'Home',
      backgroundColor: backgroundColor,
      category: 'home',
    );
  }
}
