import 'dart:io';
import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:path_provider/path_provider.dart';

class Presentation6VideoFilePlayer extends StatefulWidget {
  final String videoFilePath;
  final String title;
  final String description;
  final String teacherName;
  final String? videoUrl; // Add this to pass the original download URL

  const Presentation6VideoFilePlayer({
    Key? key,
    required this.videoFilePath,
    required this.title,
    required this.description,
    required this.teacherName,
    this.videoUrl, // Optional parameter for download URL
  }) : super(key: key);

  @override
  State<Presentation6VideoFilePlayer> createState() =>
      _Presentation6VideoFilePlayerState();
}

class _Presentation6VideoFilePlayerState
    extends State<Presentation6VideoFilePlayer> {
  late VideoPlayerController _videoPlayerController;
  ChewieController? _chewieController;
  bool _isLoading = true;
  String? _errorMessage;
  double _downloadProgress = 0.0;
  bool _isDownloading = false;

  @override
  void initState() {
    super.initState();
    _prepareAndPlay();
  }

  Future<void> _prepareAndPlay() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      // Get the application documents directory
      final directory = await getApplicationDocumentsDirectory();
      final videosDir = Directory('${directory.path}/videos');

      // Ensure the videos directory exists
      if (!await videosDir.exists()) {
        await videosDir.create(recursive: true);
      }

      // Check if file already exists locally
      final file = File(widget.videoFilePath);

      if (!await file.exists()) {
        // File doesn't exist, need to download it
        if (widget.videoUrl != null && widget.videoUrl!.isNotEmpty) {
          await _downloadVideo(widget.videoUrl!, widget.videoFilePath);
        } else {
          throw Exception(
            'Video file not found locally and no download URL provided',
          );
        }
      }

      // Initialize video player with the local file
      _videoPlayerController = VideoPlayerController.file(file);
      await _videoPlayerController.initialize();

      _chewieController = ChewieController(
        videoPlayerController: _videoPlayerController,
        autoPlay: true,
        looping: false,
        aspectRatio: _videoPlayerController.value.aspectRatio,
        showControls: true,
        materialProgressColors: ChewieProgressColors(
          playedColor: Theme.of(context).primaryColor,
          handleColor: Theme.of(context).primaryColor,
          backgroundColor: Colors.grey,
          bufferedColor: Colors.lightGreen,
        ),
        placeholder: Container(
          color: Colors.black,
          child: const Center(child: CircularProgressIndicator()),
        ),
        autoInitialize: true,
      );

      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load video: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _downloadVideo(String videoUrl, String localPath) async {
    try {
      setState(() {
        _isDownloading = true;
        _downloadProgress = 0.0;
      });

      // Show download progress
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Downloading video...'),
            duration: Duration(seconds: 2),
          ),
        );
      }

      // Use DefaultCacheManager to download the file
      final downloadedFile = await DefaultCacheManager().getSingleFile(
        videoUrl,
        headers: {'Accept': 'video/*'},
      );

      // Copy the downloaded file to our local path
      await downloadedFile.copy(localPath);

      setState(() {
        _isDownloading = false;
        _downloadProgress = 1.0;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Video downloaded successfully!'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      setState(() {
        _isDownloading = false;
        _downloadProgress = 0.0;
      });
      throw Exception('Failed to download video: $e');
    }
  }

  Future<void> _retryDownload() async {
    if (widget.videoUrl != null && widget.videoUrl!.isNotEmpty) {
      await _prepareAndPlay();
    }
  }

  @override
  void dispose() {
    _videoPlayerController.dispose();
    _chewieController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: Colors.blue[600],
        foregroundColor: Colors.white,
        actions: [
          if (_chewieController != null)
            IconButton(
              icon: const Icon(Icons.fullscreen),
              onPressed: () {
                _chewieController!.enterFullScreen();
              },
            ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            flex: 3,
            child: Container(color: Colors.black, child: _buildVideoPlayer()),
          ),
          Expanded(
            flex: 1,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.title,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Teacher: ${widget.teacherName}',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: Colors.blue[600],
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: SingleChildScrollView(
                      child: Text(
                        widget.description,
                        style: const TextStyle(fontSize: 14),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVideoPlayer() {
    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
              const SizedBox(height: 16),
              Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _retryDownload,
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_isLoading || _isDownloading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(color: Colors.white),
            const SizedBox(height: 16),
            Text(
              _isDownloading ? 'Downloading video...' : 'Loading video...',
              style: const TextStyle(color: Colors.white),
            ),
            if (_isDownloading) ...[
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32.0),
                child: LinearProgressIndicator(
                  value: _downloadProgress,
                  backgroundColor: Colors.grey[600],
                  valueColor: AlwaysStoppedAnimation<Color>(
                    Theme.of(context).primaryColor,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '${(_downloadProgress * 100).toInt()}%',
                style: const TextStyle(color: Colors.white),
              ),
            ],
          ],
        ),
      );
    }

    if (_chewieController != null) {
      return Chewie(controller: _chewieController!);
    }

    return const Center(child: CircularProgressIndicator(color: Colors.white));
  }
}
