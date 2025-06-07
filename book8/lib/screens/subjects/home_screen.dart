import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class HomeScreen extends StatelessWidget {
  static const routeName = '/home';
  final Color backgroundColor;

  const HomeScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final homeItems = [
      'Living Room', 'Kitchen', 'Bathroom', 'Bedroom', 'Dining Room',
      'Garage', 'Garden', 'Basement', 'Attic', 'Front Door',
      'Back Door', 'Windows', 'Stairs', 'Hallway', 'Closet',
      'Laundry Room', 'Office', 'Playroom', 'Storage', 'Patio'
    ];

    return BaseSubjectScreen(
      title: 'Home',
      backgroundColor: backgroundColor,
      children: homeItems.map((item) => 
        SizedBox(
          width: 150,
          height: 150,
          child: Card(
            elevation: 4,
            child: InkWell(
              onTap: () {
                // TODO: Add video or detailed view for each home item
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
