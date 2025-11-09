import 'package:flutter/material.dart';
import 'drag_drop_game.dart';

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
              Flexible(
                child: Text(
                  'Coming Soon!',
                  overflow: TextOverflow.ellipsis,
                ),
              ),
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
    VoidCallback? onTap,
  }) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isSmallDevice = constraints.maxWidth < 180;
        
        return Card(
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16)
          ),
          child: InkWell(
            onTap: onTap ?? () => _showComingSoonDialog(context, title),
            borderRadius: BorderRadius.circular(16),
            child: Padding(
              padding: EdgeInsets.all(isSmallDevice ? 8.0 : 16.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: isSmallDevice ? 40 : 60,
                    height: isSmallDevice ? 40 : 60,
                    decoration: BoxDecoration(
                      color: backgroundColor.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      icon, 
                      size: isSmallDevice ? 24 : 32,
                      color: backgroundColor
                    ),
                  ),
                  SizedBox(height: isSmallDevice ? 8 : 16),
                  Flexible(
                    child: Text(
                      title,
                      style: TextStyle(
                        fontSize: isSmallDevice ? 14 : 18,
                        fontWeight: FontWeight.bold,
                        color: backgroundColor,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  SizedBox(height: isSmallDevice ? 4 : 8),
                  Flexible(
                    child: Text(
                      description,
                      style: TextStyle(
                        fontSize: isSmallDevice ? 12 : 14,
                        color: Colors.grey[600]
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Learning Games'),
        backgroundColor: backgroundColor,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final crossAxisCount = constraints.maxWidth < 600 ? 2 : 3;
          
          return GridView.count(
            crossAxisCount: crossAxisCount,
            padding: const EdgeInsets.all(16),
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: constraints.maxHeight > 600 ? 0.85 : 1.0,
            children: [
              _buildGameCard(
                title: 'Drag & Drop',
                icon: Icons.touch_app,
                description: 'Match words to pictures by dragging them',
                context: context,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const DragDropGame()),
                  );
                },
              ),
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
            ],
          );
        },
      ),
    );
  }
}