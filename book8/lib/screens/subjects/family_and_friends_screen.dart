import 'package:flutter/material.dart';
import 'package:book8/screens/subjects/base_subject_screen.dart';

class FamilyAndFriendsScreen extends StatelessWidget {
  static const routeName = '/family-and-friends';
  final Color backgroundColor;

  const FamilyAndFriendsScreen({
    super.key,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final familyItems = [
      'Mom', 'Dad', 'Brother', 'Sister', 'Grandma',
      'Grandpa', 'Aunt', 'Uncle', 'Cousin', 'Best Friend',
      'Teacher', 'Doctor', 'Neighbor', 'Classmate', 'Pet',
      'Babysitter', 'Coach', 'Therapist', 'Family Time', 'Play Date'
    ];

    return BaseSubjectScreen(
      title: 'Family & Friends',
      backgroundColor: backgroundColor,
      children: familyItems.map((item) => 
        SizedBox(
          width: 150,
          height: 150,
          child: Card(
            elevation: 4,
            child: InkWell(
              onTap: () {
                // TODO: Add video or detailed view for each family/friend item
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
