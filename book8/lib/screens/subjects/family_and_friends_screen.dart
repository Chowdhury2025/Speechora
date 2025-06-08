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
    return BaseSubjectScreen(
      title: 'Family & Friends',
      backgroundColor: backgroundColor,
      category: 'family_and_friends',
    );
  }
}
