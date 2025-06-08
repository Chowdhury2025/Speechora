import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class PlacesScreen extends StatelessWidget {
  static const routeName = '/places';
  final Color backgroundColor;

  const PlacesScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return BaseSubjectScreen(
      title: 'Places',
      backgroundColor: backgroundColor,
      category: 'places',
    );
  }
}
