import 'dart:io';
import 'package:flutter/material.dart';
import 'dart:async';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:path_provider/path_provider.dart';
import 'package:speachora/services/tts_service.dart';
import 'package:flutter/services.dart';

class Presentation6VideoFilePlayer extends StatefulWidget {
  final String videoFilePath;
  final String title;
  final String description;
  final String teacherName;
  final String? videoUrl; // Add this to pass the original download URL
  
  // TTS fields
  final String language;
  final String voiceType;
  final double speechRate;

  const Presentation6VideoFilePlayer({
    Key? key,
    required this.videoFilePath,
    required this.title,
    required this.description,
    required this.teacherName,
    this.videoUrl, // Optional parameter for download URL
    this.language = 'en',
    this.voiceType = 'default',
    this.speechRate = 1.0,
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
  
  // TTS variables
  final TTSService _ttsService = TTSService();
  bool _isSpeaking = false;

  @override
  void initState() {
    super.initState();
    // Use edge-to-edge system UI so status/navigation bars remain visible
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    _initializeTts();
    _prepareAndPlay();
  }

  Future<void> _initializeTts() async {
    await _ttsService.init();
    
    // Set up TTS callbacks
    _ttsService.setStartHandler(() {
      setState(() {
        _isSpeaking = true;
      });
    });
    
    _ttsService.setCompletionHandler(() {
      setState(() {
        _isSpeaking = false;
      });
    });
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

      // Mute the video audio
      _videoPlayerController.setVolume(0.0);

      _chewieController = ChewieController(
        videoPlayerController: _videoPlayerController,
        autoPlay: false, // Do not auto play
        looping: false,
        aspectRatio: _videoPlayerController.value.aspectRatio,
        showControls: false, // Hide controls for kids
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

      // Play the video (muted)
      _videoPlayerController.play();
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

  

  @override
  void dispose() {
    _videoPlayerController.dispose();
    _chewieController?.dispose();
    _ttsService.stop();
    // Reset system UI mode
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual, overlays: SystemUiOverlay.values);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Detailed (non-fullscreen) video presentation layout
    final bgColor = const Color(0xFFD9F0EB); // soft mint background
    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Stack(
          children: [
            // Main content
            Column(
              children: [
                // Top navigation row with back and next/prev arrows
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
                  child: Row(
                    children: [
                      IconButton(
                        onPressed: () => Navigator.of(context).maybePop(),
                        icon: const Icon(Icons.arrow_back, size: 28, color: Color(0xFF0F3B3A)),
                      ),
                      const Spacer(),
                      IconButton(
                        onPressed: () {},
                        icon: const Icon(Icons.chevron_left, size: 28, color: Color(0xFF0F3B3A)),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        onPressed: () {},
                        icon: const Icon(Icons.chevron_right, size: 28, color: Color(0xFF0F3B3A)),
                      ),
                    ],
                  ),
                ),

                // Title shown in a rounded pill to match the description style
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 28, vertical: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF6D6), // same pale yellow as description
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.06),
                        blurRadius: 8,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: SizedBox(
                    width: double.infinity,
                    child: Text(
                      widget.title,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF0F3B3A),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 8),

                // Video / Image card placed directly below the title.
                // Use Flexible + SingleChildScrollView so the video and
                // description stay close to the title but remain scrollable
                // on smaller screens.
                Flexible(
                  fit: FlexFit.loose,
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.only(bottom: 24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          margin: const EdgeInsets.symmetric(horizontal: 18),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(22),
                            border: Border.all(color: Colors.white, width: 6),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.12),
                                blurRadius: 12,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: SizedBox(
                              height: 260,
                              width: MediaQuery.of(context).size.width - 96,
                              child: Stack(
                                children: [
                                  // Video player or placeholder image (tap to toggle, no icon)
                                  Positioned.fill(
                                    child: GestureDetector(
                                      behavior: HitTestBehavior.opaque,
                                      onTap: _onCardTap,
                                      child: _chewieController != null
                                          ? AspectRatio(
                                              aspectRatio: _videoPlayerController.value.aspectRatio > 0
                                                  ? _videoPlayerController.value.aspectRatio
                                                  : 16 / 9,
                                              child: Chewie(controller: _chewieController!),
                                            )
                                          : widget.videoUrl != null && widget.videoUrl!.isNotEmpty
                                              ? Image.network(
                                                  widget.videoUrl!,
                                                  fit: BoxFit.cover,
                                                  errorBuilder: (_, __, ___) => Container(color: Colors.grey[200]),
                                                )
                                              : Container(color: Colors.grey[200]),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 12),

                        // Description rounded pill (closer to the video)
                        Container(
                          margin: const EdgeInsets.symmetric(horizontal: 28),
                          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF6D6), // pale yellow
                            borderRadius: BorderRadius.circular(18),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.06),
                                blurRadius: 8,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: SizedBox(
                            width: double.infinity,
                            child: Text(
                              widget.description,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF0F3B3A),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            // Status overlay: shows only when loading, downloading or error
            if (_isLoading || _isDownloading || _errorMessage != null) ...[
              Positioned.fill(
                child: Container(
                  color: Colors.black.withOpacity(0.35),
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (_isLoading) const CircularProgressIndicator(color: Colors.white),
                        if (_isDownloading) ...[
                          const CircularProgressIndicator(color: Colors.white),
                          const SizedBox(height: 12),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 48.0),
                            child: LinearProgressIndicator(value: _downloadProgress, color: Colors.white),
                          ),
                          const SizedBox(height: 8),
                          Text('${(_downloadProgress * 100).toInt()}%', style: const TextStyle(color: Colors.white)),
                        ],
                        if (_errorMessage != null) ...[
                          const Icon(Icons.error_outline, size: 64, color: Colors.redAccent),
                          const SizedBox(height: 12),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24.0),
                            child: Text(
                              _errorMessage ?? '',
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: Colors.white),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _togglePlayPause() {
    if (!mounted) return;
    if (_chewieController == null) return;
    if (_videoPlayerController.value.isPlaying) {
      _videoPlayerController.pause();
    } else {
      _videoPlayerController.play();
    }
    setState(() {});
  }

  Future<void> _speakAndWait(String text) async {
    if (text.isEmpty) return;
    final completer = Completer<void>();

    void onComplete() {
      if (!completer.isCompleted) completer.complete();
    }

    // Temporarily attach a completion handler
    _ttsService.setCompletionHandler(() {
      onComplete();
      // restore state
      setState(() {
        _isSpeaking = false;
      });
    });

    setState(() {
      _isSpeaking = true;
    });

    await _ttsService.speak(text);

    // Wait for completion (guard timeout)
    await Future.any([
      completer.future,
      Future.delayed(const Duration(seconds: 10)),
    ]);
  }

  Future<void> _onCardTap() async {
    // Read title first, then description, then play the video
    try {
      await _speakAndWait(widget.title);
      await _speakAndWait(widget.description);

      // After TTS, start playback if not playing
      if (!_videoPlayerController.value.isPlaying) {
        _videoPlayerController.play();
        setState(() {});
      }
    } catch (_) {
      // fallback: toggle play/pause
      _togglePlayPause();
    }
  }

  

  
}
