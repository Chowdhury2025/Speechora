import 'package:flutter/material.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';

class Presentation6YouTubePlayer extends StatefulWidget {
  final String youtubeUrl;
  final String title;
  final String description;
  final String teacherName;

  const Presentation6YouTubePlayer({
    Key? key,
    required this.youtubeUrl,
    required this.title,
    required this.description,
    required this.teacherName,
  }) : super(key: key);

  @override
  State<Presentation6YouTubePlayer> createState() =>
      _Presentation6YouTubePlayerState();
}

class _Presentation6YouTubePlayerState
    extends State<Presentation6YouTubePlayer> {
  YoutubePlayerController? _controller;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _initializePlayer();
  }

  @override
  void dispose() {
    _controller?.close();
    super.dispose();
  }

  Future<void> _initializePlayer() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final videoId = _extractVideoId(widget.youtubeUrl);
      if (videoId == null) {
        setState(() {
          _errorMessage = 'Invalid YouTube URL provided.';
          _isLoading = false;
        });
        return;
      }
      final controller = YoutubePlayerController(
        params: const YoutubePlayerParams(
          mute: false,
          showControls: true,
          showFullscreenButton: true,
        ),
      );
      controller.loadVideoById(videoId: videoId);
      setState(() {
        _controller = controller;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load YouTube player: $e';
        _isLoading = false;
      });
    }
  }

  String? _extractVideoId(String url) {
    final RegExp regExp = RegExp(r'(?:v=|\/)([0-9A-Za-z_-]{11})(?:[?&\/]|$)');
    final match = regExp.allMatches(url).toList();
    if (match.isNotEmpty) {
      return match.last.group(1);
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: Text(widget.title)),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_errorMessage != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Error')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 64, color: Colors.red),
                const SizedBox(height: 16),
                Text(
                  _errorMessage!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 18),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _initializePlayer,
                  child: const Text('Retry'),
                ),
                const SizedBox(height: 8),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Go Back'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Column(
        children: [
          AspectRatio(
            aspectRatio: 16 / 9,
            child:
                _controller != null
                    ? YoutubePlayer(controller: _controller!)
                    : const Center(child: Icon(Icons.error)),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (widget.description.isNotEmpty) ...[
                    const Text(
                      'Description:',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(widget.description),
                    const SizedBox(height: 16),
                  ],
                  if (widget.teacherName.isNotEmpty) ...[
                    const Text(
                      'Teacher:',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(widget.teacherName),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
