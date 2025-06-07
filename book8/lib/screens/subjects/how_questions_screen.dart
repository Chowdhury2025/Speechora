import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class HowQuestionsScreen extends StatelessWidget {
  static const routeName = '/how-questions';
  final Color backgroundColor;

  const HowQuestionsScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final questionItems = [
      'How to do this?', 'How to make it?', 'How to fix it?', 'How to play?', 'How to help?',
      'How to start?', 'How to finish?', 'How to open?', 'How to close?', 'How to get there?',
      'How do you feel?', 'How was school?', 'How was your day?', 'How does it work?', 'How much?',
      'How many?', 'How big?', 'How small?', 'How fast?', 'How slow?'
    ];

    return BaseSubjectScreen(
      title: 'How Questions',
      backgroundColor: backgroundColor,
      children: questionItems.map((item) => 
        SizedBox(
          width: 150,
          height: 150,
          child: Card(
            elevation: 4,
            child: InkWell(
              onTap: () {
                // TODO: Add video or detailed view for each question item
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
