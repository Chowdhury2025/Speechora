import 'package:flutter/material.dart';

class BaseSubjectScreen extends StatelessWidget {
  final String title;
  final Color backgroundColor;
  final List<Widget> children;

  const BaseSubjectScreen({
    super.key,
    required this.title,
    required this.backgroundColor,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        backgroundColor: backgroundColor,
      ),
      body: Container(
        padding: const EdgeInsets.all(16.0),
        child: GridView.count(
          crossAxisCount: 2,
          mainAxisSpacing: 16.0,
          crossAxisSpacing: 16.0,
          children: children,
        ),
      ),
    );
  }
}
