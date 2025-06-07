import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class ActionsAndVerbsScreen extends StatelessWidget {
  static const routeName = '/actions-and-verbs';
  final Color backgroundColor;

  const ActionsAndVerbsScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final actionItems = [
      'Walk', 'Run', 'Jump', 'Sleep', 'Eat',
      'Drink', 'Play', 'Read', 'Write', 'Draw',
      'Sing', 'Dance', 'Swim', 'Climb', 'Throw',
      'Catch', 'Push', 'Pull', 'Open', 'Close'
    ];

    return BaseSubjectScreen(
      title: 'Actions / Verbs',
      backgroundColor: backgroundColor,
      children: actionItems.map((item) => 
        SizedBox(
          width: 150,
          height: 150,
          child: Card(
            elevation: 4,
            child: InkWell(
              onTap: () {
                // TODO: Add video or detailed view for each action/verb item
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
