import 'package:flutter/material.dart';
import 'package:book8/screens/subjects/base_subject_screen.dart';

class SchoolScreen extends StatelessWidget {
  static const routeName = '/school';
  final Color backgroundColor;

  const SchoolScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final schoolItems = [
      'Classroom', 'Teacher', 'Students', 'Books', 'Pencils',
      'Backpack', 'Lunchbox', 'Homework', 'Math', 'Reading',
      'Writing', 'Art', 'Music', 'Gym', 'Playground',
      'Library', 'Computer Lab', 'Science Lab', 'Cafeteria', 'Bus'
    ];

    return BaseSubjectScreen(
      title: 'School',
      backgroundColor: backgroundColor,
      children: schoolItems.map((item) => 
        SizedBox(
          width: 150,
          height: 150,
          child: Card(
            elevation: 4,
            child: InkWell(
              onTap: () {
                // TODO: Add video or detailed view for each school item
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
