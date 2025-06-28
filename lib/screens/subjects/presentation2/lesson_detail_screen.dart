import 'package:flutter/material.dart';
import '../../../models/lesson_models.dart';
import '../../../services/tts_service.dart';

class LessonDetailScreen extends StatefulWidget {
  final Lesson lesson;
  final Color backgroundColor;

  const LessonDetailScreen({
    super.key,
    required this.lesson,
    required this.backgroundColor,
  });

  @override
  State<LessonDetailScreen> createState() => _LessonDetailScreenState();
}

class _LessonDetailScreenState extends State<LessonDetailScreen> {
  final TTSService _tts = TTSService();

  Widget _buildContentWidget(Map<String, dynamic> content) {
    switch (content['type']) {
      case 'text':
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Expanded(
                child: Text(
                  content['content'],
                  style: const TextStyle(fontSize: 18),
                  textAlign: TextAlign.center,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.volume_up),
                onPressed: () => _tts.speak(content['content'] ?? ''),
                tooltip: 'Speak',
              ),
            ],
          ),
        );
      case 'image_url':
        return Stack(
          children: [
            Image.network(
              content['content'],
              fit: BoxFit.cover,
              errorBuilder:
                  (context, error, stackTrace) => Container(
                    height: 200,
                    color: Colors.grey[200],
                    child: const Icon(Icons.image_not_supported, size: 50),
                  ),
            ),
            if (content['description'] != null)
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  color: Colors.black54,
                  padding: const EdgeInsets.all(8),
                  child: Text(
                    content['description'],
                    style: const TextStyle(color: Colors.white),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        );
      case 'video_url':
        return Container(
          height: 200,
          color: Colors.black87,
          child: const Center(
            child: Icon(
              Icons.play_circle_outline,
              size: 64,
              color: Colors.white,
            ),
          ),
        );
      default:
        return const SizedBox.shrink();
    }
  }

  void _handleOptionTap(Map<String, dynamic> option) {
    if (option['type'] == 'text') {
      _tts.speak(option['content']);
    } else if (option['type'] == 'image_url') {
      showDialog(
        context: context,
        builder:
            (context) => Dialog(
              child: _ImageOptionDialog(
                imageUrl: option['content'],
                description: option['description'],
                tts: _tts,
              ),
            ),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    // Play the statement text (if type is text) when the screen opens
    final statement = widget.lesson.statement;
    if (statement is Map<String, dynamic> && statement['type'] == 'text') {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _tts.speak(statement['content'] ?? '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.lesson.title),
        backgroundColor: widget.backgroundColor,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (widget.lesson.description != null)
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  widget.lesson.description!,
                  style: const TextStyle(fontSize: 16),
                ),
              ),
            // Statement
            _buildContentWidget(widget.lesson.statement),
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                'Options:',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ),
            // Options Grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 1,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              itemCount: widget.lesson.options.length,
              itemBuilder: (context, index) {
                final option = widget.lesson.options[index];
                return Card(
                  elevation: 4,
                  child: InkWell(
                    onTap: () => _handleOptionTap(option),
                    child: _buildContentWidget(option),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _tts.stop();
    super.dispose();
  }
}

class _ImageOptionDialog extends StatefulWidget {
  final String imageUrl;
  final String? description;
  final TTSService tts;
  const _ImageOptionDialog({
    required this.imageUrl,
    this.description,
    required this.tts,
  });
  @override
  State<_ImageOptionDialog> createState() => _ImageOptionDialogState();
}

class _ImageOptionDialogState extends State<_ImageOptionDialog> {
  @override
  void initState() {
    super.initState();
    if (widget.description != null && widget.description!.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        widget.tts.speak(widget.description!);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Image.network(widget.imageUrl, fit: BoxFit.contain),
        if (widget.description != null)
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(widget.description!),
          ),
        IconButton(
          icon: const Icon(Icons.volume_up),
          onPressed: () => widget.tts.speak(widget.description ?? ''),
          tooltip: 'Speak Description',
        ),
      ],
    );
  }
}
