import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class OthersScreen extends StatelessWidget {
  static const routeName = '/others';
  final Color backgroundColor;

  const OthersScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final otherItems = [
      'Weather', 'Emotions', 'Colors', 'Numbers', 'Shapes',
      'Animals', 'Nature', 'Transportation', 'Holidays', 'Calendar',
      'Time', 'Money', 'Clothes', 'Body Parts', 'Safety',
      'Rules', 'Manners', 'Tools', 'Jobs', 'Special Events'
    ];

    return BaseSubjectScreen(
      title: 'Others',
      backgroundColor: backgroundColor,
      children: otherItems.map((item) => 
        SizedBox(
          width: 150,
          height: 150,
          child: Card(
            elevation: 4,
            child: InkWell(
              onTap: () {
                // TODO: Add video or detailed view for each other item
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
