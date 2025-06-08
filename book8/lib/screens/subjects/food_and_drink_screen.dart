import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class FoodAndDrinkScreen extends StatelessWidget {
  static const routeName = '/food-and-drink';
  final Color backgroundColor;

  const FoodAndDrinkScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return BaseSubjectScreen(
      title: 'Food & Drink',
      backgroundColor: backgroundColor,
      category: 'food_and_drink',
    );
  }
}
