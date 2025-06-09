import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class DailyLifeScreen extends StatelessWidget {
  final Color backgroundColor;

  const DailyLifeScreen({super.key, required this.backgroundColor});

  @override
  Widget build(BuildContext context) {
    return BaseSubjectScreen(
      title: 'My World & Daily Life',
      backgroundColor: backgroundColor,
      category:
          'My World & Daily Life', // This will be converted to my_world_daily_life by VideoService
    );
  }
}
