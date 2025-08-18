import 'package:book8/constants/constants.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:path_provider/path_provider.dart';
import 'package:crypto/crypto.dart';
import 'package:video_player/video_player.dart';
import 'presentation6_youtube_player.dart';
import 'presentation6_video_file_player.dart';

class VideoCategoriesScreen extends StatefulWidget {
  const VideoCategoriesScreen({super.key, required Color backgroundColor});

  @override
  State<VideoCategoriesScreen> createState() => _VideoCategoriesScreenState();
}

class _VideoCategoriesScreenState extends State<VideoCategoriesScreen> {
  List<VideoModel> videos = [];
  List<String> categories = [];
  String selectedCategory = '';
  bool isLoading = true;
  String? errorMessage;

  // Replace with your actual API URL
  static const String apiUrl = Constants.baseUrl;

  @override
  void initState() {
    super.initState();
    fetchVideos();
  }

  Future<void> fetchVideos() async {
    try {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });

      // First, fetch categories
      final categoriesResponse = await http.get(
        Uri.parse('$apiUrl/videos/categories'),
        headers: {'Content-Type': 'application/json'},
      );

      if (categoriesResponse.statusCode != 200) {
        throw Exception('Failed to load categories');
      }

      final List<dynamic> categoryData = json.decode(categoriesResponse.body);
      categories = categoryData.map((c) => c.toString()).toList();

      // Then fetch videos
      final response = await http.get(
        Uri.parse('$apiUrl/videos'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> videoData = json.decode(response.body);
        List<VideoModel> processedVideos = [];

        for (var videoJson in videoData) {
          var video = VideoModel.fromJson(videoJson);
          processedVideos.add(video);
        }

        setState(() {
          videos = processedVideos;
          isLoading = false;
        });
      } else {
        throw Exception('Failed to load videos');
      }
    } catch (e) {
      setState(() {
        errorMessage = 'Failed to fetch videos: $e';
        isLoading = false;
      });
    }
  }

  Future<void> fetchVideosByCategory(String category) async {
    try {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });

      if (category.isEmpty) {
        await fetchVideos();
        return;
      }

      final response = await http.post(
        Uri.parse('$apiUrl/videos/category'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'category': category}),
      );

      if (response.statusCode == 200) {
        final List<dynamic> videoData = json.decode(response.body);
        List<VideoModel> processedVideos = [];

        for (var videoJson in videoData) {
          var video = VideoModel.fromJson(videoJson);
          processedVideos.add(video);
        }

        setState(() {
          videos = processedVideos;
          isLoading = false;
        });
      } else {
        throw Exception('Failed to load videos for category');
      }
    } catch (e) {
      setState(() {
        errorMessage = 'Failed to fetch videos: $e';
        isLoading = false;
      });
    }
  }

  List<VideoModel> get filteredVideos => videos;

  Future<void> deleteVideo(String videoId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Delete Video'),
            content: const Text('Are you sure you want to delete this video?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                style: TextButton.styleFrom(foregroundColor: Colors.red),
                child: const Text('Delete'),
              ),
            ],
          ),
    );

    if (confirmed == true) {
      try {
        final response = await http.delete(
          Uri.parse('$apiUrl/api/videos/$videoId'),
          headers: {'Content-Type': 'application/json'},
        );

        if (response.statusCode == 200) {
          setState(() {
            videos.removeWhere((video) => video.id == videoId);
          });
        } else {
          throw Exception('Failed to delete video');
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to delete video: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<void> playVideo(VideoModel video) async {
    try {
      if (video.youtubeLink.isNotEmpty) {
        // Play YouTube video in-app
        Navigator.push(
          context,
          MaterialPageRoute(
            builder:
                (context) => Presentation6YouTubePlayer(
                  youtubeUrl: video.youtubeLink,
                  title: video.title,
                  description: video.description,
                  teacherName: video.name,
                ),
          ),
        );
      } else if (video.videoUrl.isNotEmpty) {
        // Prepare local video path
        final directory = await getApplicationDocumentsDirectory();
        final videoHash =
            sha256.convert(utf8.encode(video.videoUrl)).toString();
        final localPath = '${directory.path}/videos/$videoHash.mp4';

        // Navigate to video player (it will handle download if needed)
        if (mounted) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder:
                  (context) => Presentation6VideoFilePlayer(
                    videoFilePath: localPath,
                    title: video.title,
                    description: video.description,
                    teacherName: video.name,
                    videoUrl:
                        video.videoUrl, // Pass the original URL for downloading
                  ),
            ),
          );
        }
      } else {
        throw Exception('No valid video URL found');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error playing video: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  String getYoutubeThumbnail(String youtubeUrl) {
    if (youtubeUrl.isEmpty) {
      return 'https://via.placeholder.com/150?text=No+Thumbnail';
    }

    final regExp = RegExp(
      r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
    );
    final match = regExp.firstMatch(youtubeUrl);
    if (match != null) {
      final videoId = match.group(1);
      // Try maxresdefault first, hqdefault will be used as fallback in CachedNetworkImage
      return 'https://img.youtube.com/vi/$videoId/maxresdefault.jpg';
    }
    return 'https://via.placeholder.com/150?text=No+Thumbnail';
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        backgroundColor: const Color(0xFF58CC02), // Duolingo green
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(40),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF58CC02)),
                    strokeWidth: 3,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Loading videos...',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (errorMessage != null) {
      return Scaffold(
        backgroundColor: const Color(0xFF58CC02),
        body: Center(
          child: Container(
            margin: const EdgeInsets.all(32),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFF4B4B),
                    borderRadius: BorderRadius.circular(40),
                  ),
                  child: const Icon(
                    Icons.error_outline,
                    size: 40,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'Oops! Something went wrong',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[800],
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  errorMessage!,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                Container(
                  width: double.infinity,
                  height: 50,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF58CC02), Color(0xFF4FB800)],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                    borderRadius: BorderRadius.circular(25),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF4FB800).withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ElevatedButton(
                    onPressed: fetchVideos,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(25),
                      ),
                    ),
                    child: const Text(
                      'Try Again',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF58CC02),
      body: SafeArea(
        child: Column(
          children: [
            // Custom Header
            Container(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(
                        Icons.arrow_back,
                        color: Colors.white,
                        size: 20,
                      ),
                      padding: EdgeInsets.zero,
                    ),
                  ),
                  const Expanded(
                    child: Text(
                      'Educational Videos',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: IconButton(
                      onPressed: () {
                        Navigator.pushNamed(context, '/videos-upload');
                      },
                      icon: const Icon(
                        Icons.add,
                        color: Colors.white,
                        size: 20,
                      ),
                      padding: EdgeInsets.zero,
                    ),
                  ),
                ],
              ),
            ),

            // Category Filter with Duolingo style
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 20),
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: DropdownButtonFormField<String>(
                value: selectedCategory.isEmpty ? null : selectedCategory,
                decoration: const InputDecoration(
                  labelText: 'Choose Category',
                  labelStyle: TextStyle(
                    color: Color(0xFF777777),
                    fontWeight: FontWeight.w600,
                  ),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 16,
                  ),
                ),
                style: const TextStyle(
                  color: Color(0xFF333333),
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
                items: [
                  const DropdownMenuItem<String>(
                    value: '',
                    child: Text('🎯 All Categories'),
                  ),
                  ...categories.map(
                    (category) => DropdownMenuItem<String>(
                      value: category,
                      child: Text('📚 $category'),
                    ),
                  ),
                ],
                onChanged: (value) {
                  setState(() {
                    selectedCategory = value ?? '';
                  });
                  fetchVideosByCategory(selectedCategory);
                },
              ),
            ),

            const SizedBox(height: 20),

            // Video List/Grid
            Expanded(
              child: Container(
                decoration: const BoxDecoration(
                  color: Color(0xFFF7F7F7),
                  borderRadius: BorderRadius.vertical(
                    top: Radius.circular(30),
                  ),
                ),
                child: filteredVideos.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 120,
                              height: 120,
                              decoration: BoxDecoration(
                                color: const Color(0xFFE5E5E5),
                                borderRadius: BorderRadius.circular(60),
                              ),
                              child: const Icon(
                                Icons.video_library_outlined,
                                size: 60,
                                color: Color(0xFF777777),
                              ),
                            ),
                            const SizedBox(height: 20),
                            Text(
                              selectedCategory.isEmpty
                                  ? '🎬 No videos available yet!'
                                  : '📂 No videos in this category',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF777777),
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Check back later for new content',
                              style: TextStyle(
                                fontSize: 14,
                                color: Color(0xFF999999),
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(20),
                        itemCount: filteredVideos.length,
                        itemBuilder: (context, index) {
                          final video = filteredVideos[index];
                          return VideoCard(
                            video: video,
                            onPlay: () => playVideo(video),
                            onDelete: () => deleteVideo(video.id),
                            getThumbnail: getYoutubeThumbnail,
                          );
                        },
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class VideoCard extends StatelessWidget {
  final VideoModel video;
  final VoidCallback onPlay;
  final VoidCallback onDelete;
  final String Function(String) getThumbnail;

  const VideoCard({
    super.key,
    required this.video,
    required this.onPlay,
    required this.onDelete,
    required this.getThumbnail,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: InkWell(
        onTap: onPlay,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Thumbnail
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  gradient: const LinearGradient(
                    colors: [Color(0xFF58CC02), Color(0xFF4FB800)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: CachedNetworkImage(
                        imageUrl: getThumbnail(video.youtubeLink),
                        width: 80,
                        height: 80,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFF58CC02),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Center(
                            child: CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              strokeWidth: 2,
                            ),
                          ),
                        ),
                        errorWidget: (context, url, error) {
                          // If maxresdefault fails, try hqdefault
                          if (url.contains('maxresdefault')) {
                            final regExp = RegExp(
                              r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
                            );
                            final match = regExp.firstMatch(video.youtubeLink);
                            if (match != null) {
                              final videoId = match.group(1);
                              return CachedNetworkImage(
                                imageUrl:
                                    'https://img.youtube.com/vi/$videoId/hqdefault.jpg',
                                width: 80,
                                height: 80,
                                fit: BoxFit.cover,
                                placeholder: (context, url) => Container(
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF58CC02),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Center(
                                    child: CircularProgressIndicator(
                                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                      strokeWidth: 2,
                                    ),
                                  ),
                                ),
                                errorWidget: (context, url, error) => Container(
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF58CC02),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Center(
                                    child: Icon(
                                      Icons.play_circle_filled,
                                      size: 32,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              );
                            }
                          }
                          return Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFF58CC02),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Center(
                              child: Icon(
                                Icons.play_circle_filled,
                                size: 32,
                                color: Colors.white,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    // Play button overlay
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.play_arrow,
                            size: 32,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(width: 16),
              
              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      video.title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF333333),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    if (video.name.isNotEmpty) ...[
                      Row(
                        children: [
                          const Icon(
                            Icons.person_outline,
                            size: 14,
                            color: Color(0xFF777777),
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              video.name,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF777777),
                                fontWeight: FontWeight.w500,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                    ],
                    if (video.category.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFF58CC02).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          video.category,
                          style: const TextStyle(
                            fontSize: 10,
                            color: Color(0xFF58CC02),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              
              // Options button
              PopupMenuButton<String>(
                icon: const Icon(
                  Icons.more_vert,
                  color: Color(0xFF777777),
                  size: 20,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                itemBuilder: (context) => [
                  PopupMenuItem<String>(
                    value: 'play',
                    child: Row(
                      children: [
                        Icon(
                          Icons.play_arrow,
                          size: 16,
                          color: Colors.grey[700],
                        ),
                        const SizedBox(width: 8),
                        const Text('Play Video'),
                      ],
                    ),
                  ),
                  PopupMenuItem<String>(
                    value: 'delete',
                    child: Row(
                      children: [
                        const Icon(
                          Icons.delete_outline,
                          size: 16,
                          color: Colors.red,
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Delete',
                          style: TextStyle(color: Colors.red),
                        ),
                      ],
                    ),
                  ),
                ],
                onSelected: (value) {
                  if (value == 'play') {
                    onPlay();
                  } else if (value == 'delete') {
                    onDelete();
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class VideoModel {
  final String id;
  final String title;
  final String name;
  final String category;
  final String ageGroup;
  final String description;
  final String videoUrl;
  final String youtubeLink;

  VideoModel({
    required this.id,
    required this.title,
    required this.name,
    required this.category,
    required this.ageGroup,
    required this.description,
    required this.videoUrl,
    required this.youtubeLink,
  });

  factory VideoModel.fromJson(Map<String, dynamic> json) {
    return VideoModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      name: json['name'] ?? '',
      category: json['category'] ?? '',
      ageGroup: json['ageGroup'] ?? '',
      description: json['description'] ?? '',
      videoUrl: json['video_url'] ?? '',
      youtubeLink: json['linkyoutube_link'] ?? '',
    );
  }
}

class VideoPlayerScreen extends StatefulWidget {
  final String videoUrl;

  const VideoPlayerScreen({super.key, required this.videoUrl});

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<VideoPlayerScreen> {
  late VideoPlayerController _controller;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.videoUrl));
    _controller.initialize().then((_) {
      setState(() {
        _isInitialized = true;
      });
      _controller.play();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Video Player'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      backgroundColor: Colors.black,
      body: Center(
        child:
            _isInitialized
                ? AspectRatio(
                  aspectRatio: _controller.value.aspectRatio,
                  child: VideoPlayer(_controller),
                )
                : const CircularProgressIndicator(),
      ),
      floatingActionButton:
          _isInitialized
              ? FloatingActionButton(
                onPressed: () {
                  setState(() {
                    _controller.value.isPlaying
                        ? _controller.pause()
                        : _controller.play();
                  });
                },
                child: Icon(
                  _controller.value.isPlaying ? Icons.pause : Icons.play_arrow,
                ),
              )
              : null,
    );
  }
}
