import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class WhenQuestionsScreen extends StatelessWidget {
  static const routeName = '/when-questions';
  final Color backgroundColor;

  const WhenQuestionsScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final questionItems = [
      'When is it?', 'When do we go?', 'When do we eat?', 'When is bedtime?', 'When is school?',
      'When do we play?', 'When is lunch?', 'When is dinner?', 'When do you wake up?', 'When do you sleep?',
      'When is the weekend?', 'When is your birthday?', 'When is the party?', 'When do we leave?', 'When do we start?',
      'When do we finish?', 'When is break?', 'When is snack time?', 'When is bath time?', 'When do we get there?'
    ];

    return BaseSubjectScreen(
      title: 'When Questions',
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
