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
    final foodItems = [
      'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Fruits',
      'Vegetables', 'Meat', 'Fish', 'Bread', 'Rice',
      'Pasta', 'Pizza', 'Sandwich', 'Water', 'Milk',
      'Juice', 'Ice Cream', 'Cookies', 'Candy', 'Chips'
    ];

    return BaseSubjectScreen(
      title: 'Food & Drink',
      backgroundColor: backgroundColor,
      children: foodItems.map((item) => 
        SizedBox(
          width: 150,
          height: 150,
          child: Card(
            elevation: 4,
            child: InkWell(
              onTap: () {
                // TODO: Add video or detailed view for each food/drink item
              },
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.play_circle_outline,
                    size: 50,
                    color: backgroundColor,
                  ),
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(
                      item,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ).toList(),
    );
  }
}
