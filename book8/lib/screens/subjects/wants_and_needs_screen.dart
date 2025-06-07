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
    final needItems = [
      'Food', 'Water', 'Sleep', 'Bathroom', 'Medicine',
      'Help', 'Break', 'Play', 'Rest', 'Hug',
      'Attention', 'Quiet', 'Music', 'Outside', 'Inside',
      'Toy', 'Book', 'Phone', 'iPad', 'TV'
    ];

    return BaseSubjectScreen(
      title: 'I Want / Needs',
      backgroundColor: backgroundColor,
      children: needItems.map((item) => 
        SizedBox(
          width: 150,
          height: 150,
          child: Card(
            elevation: 4,
            child: InkWell(
              onTap: () {
                // TODO: Add video or detailed view for each want/need item
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
