import 'package:flutter/material.dart';
import 'package:book8/screens/subjects/base_subject_screen.dart';

class ActivitiesScreen extends StatelessWidget {
  static const routeName = '/activities';
  final Color backgroundColor;

  const ActivitiesScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final activityItems = [
      'Swimming', 'Basketball', 'Soccer', 'Baseball', 'Tennis',
      'Dancing', 'Singing', 'Drawing', 'Painting', 'Reading',
      'Playing Music', 'Running', 'Cycling', 'Playground', 'Board Games',
      'Video Games', 'Arts & Crafts', 'Building Blocks', 'Puzzles', 'Hide and Seek'
    ];

    return BaseSubjectScreen(
      title: 'Activities',
      backgroundColor: backgroundColor,
      children: activityItems.map((item) => 
        SizedBox(
          width: 150,
          height: 150,
          child: Card(
            elevation: 4,
            child: InkWell(
              onTap: () {
                // TODO: Add video or detailed view for each activity item
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
