import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class ChoiceQuestionsScreen extends StatelessWidget {
  static const routeName = '/choice-questions';
  final Color backgroundColor;

  const ChoiceQuestionsScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final questionItems = [
      'This or That?', 'Now or Later?', 'Here or There?', 'Yes or No?', 'More or Less?',
      'Big or Small?', 'Fast or Slow?', 'Hot or Cold?', 'Up or Down?', 'In or Out?',
      'Play or Rest?', 'Read or Write?', 'Walk or Run?', 'Eat or Drink?', 'Work or Play?',
      'Inside or Outside?', 'Morning or Night?', 'Before or After?', 'First or Last?', 'Start or Stop?'
    ];

    return BaseSubjectScreen(
      title: 'Choice Questions',
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
