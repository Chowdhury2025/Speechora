import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class ToysAndGamesScreen extends StatelessWidget {
  static const routeName = '/toys-and-games';
  final Color backgroundColor;

  const ToysAndGamesScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return BaseSubjectScreen(
      title: 'Toys & Games',
      backgroundColor: backgroundColor,
      category: 'toys_and_games',
    );
  }
}
