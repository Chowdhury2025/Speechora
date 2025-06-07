import 'package:flutter/material.dart';
import 'base_subject_screen.dart';

class WhereQuestionsScreen extends StatelessWidget {
  static const routeName = '/where-questions';
  final Color backgroundColor;

  const WhereQuestionsScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final questionItems = [
      'Where is it?', 'Where are you?', 'Where do you want to go?', 'Where is mom?', 'Where is dad?',
      'Where are we going?', 'Where did you put it?', 'Where does it belong?', 'Where is home?', 'Where is school?',
      'Where is the bathroom?', 'Where is your room?', 'Where are your toys?', 'Where are your books?', 'Where is your bag?',
      'Where do you play?', 'Where do you sleep?', 'Where do you eat?', 'Where is the park?', 'Where is the store?'
    ];

    return BaseSubjectScreen(
      title: 'Where Questions',
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
