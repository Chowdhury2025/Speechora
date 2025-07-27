import 'package:flutter/material.dart';

class LearningGamesScreen extends StatelessWidget {
  final Color backgroundColor;

  const LearningGamesScreen({Key? key, required this.backgroundColor})
    : super(key: key);

  void _showComingSoonDialog(BuildContext context, String gameName) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: Row(
            children: [
              Icon(Icons.hourglass_empty, color: backgroundColor),
              const SizedBox(width: 10),
              const Text('Coming Soon!'),
            ],
          ),
          content: Text(
            '$gameName will be available in a future update!',
            style: const TextStyle(fontSize: 16),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                'OK',
                style: TextStyle(
                  color: backgroundColor,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildGameCard({
    required String title,
    required IconData icon,
    required String description,
    required BuildContext context,
  }) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: () => _showComingSoonDialog(context, title),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: backgroundColor.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 32, color: backgroundColor),
              ),
              const SizedBox(height: 16),
              Text(
                title,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: backgroundColor,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                description,
                style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Learning Games'),
        backgroundColor: backgroundColor,
      ),
      body: GridView.count(
        crossAxisCount: 2,
        padding: const EdgeInsets.all(16),
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        childAspectRatio: 0.85,
        children: [
          _buildGameCard(
            title: 'Memory Match',
            icon: Icons.grid_view,
            description: 'Match pairs of images or words to improve memory',
            context: context,
          ),
          _buildGameCard(
            title: 'Word Puzzle',
            icon: Icons.abc,
            description: 'Form words and learn vocabulary',
            context: context,
          ),
          _buildGameCard(
            title: 'Picture Sort',
            icon: Icons.category,
            description: 'Sort pictures into their correct categories',
            context: context,
          ),
          _buildGameCard(
            title: 'Simple Quiz',
            icon: Icons.quiz,
            description: 'Interactive questions with visual aids',
            context: context,
          ),
          _buildGameCard(
            title: 'Sequence Game',
            icon: Icons.sort,
            description: 'Arrange pictures in the correct order',
            context: context,
          ),
        ],
      ),
    );
  }
}
