import 'package:flutter/material.dart';
import 'package:book8/screens/subjects/base_subject_screen.dart';

class TherapyScreen extends StatelessWidget {
  static const routeName = '/therapy';
  final Color backgroundColor;

  const TherapyScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final therapyItems = [
      'Physical Therapy', 'Speech Therapy', 'Occupational Therapy', 'Play Therapy', 'Exercise',
      'Stretching', 'Balance', 'Coordination', 'Fine Motor', 'Gross Motor',
      'Sensory Play', 'Communication', 'Social Skills', 'Emotional Skills', 'Behavioral Therapy',
      'Music Therapy', 'Art Therapy', 'Group Therapy', 'Individual Therapy', 'Progress Goals'
    ];

    return BaseSubjectScreen(
      title: 'Therapy',
      backgroundColor: backgroundColor,
      children: therapyItems.map((item) => 
        SizedBox(
          width: 150,
          height: 150,
          child: Card(
            elevation: 4,
            child: InkWell(
              onTap: () {
                // TODO: Add video or detailed view for each therapy item
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
