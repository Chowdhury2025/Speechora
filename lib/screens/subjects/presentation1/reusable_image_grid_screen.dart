import 'package:book8/constants/constants.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../services/tts_service.dart';

class ReusableImageGridScreen extends StatefulWidget {
  final String title;
  final String imageCategory;
  final Color backgroundColor;

  const ReusableImageGridScreen({
    super.key,
    required this.title,
    required this.imageCategory,
    required this.backgroundColor,
  });

  @override
  State<ReusableImageGridScreen> createState() =>
      _ReusableImageGridScreenState();
}

class _ReusableImageGridScreenState extends State<ReusableImageGridScreen> {
  final TTSService _ttsService = TTSService();
  List<Map<String, dynamic>> images = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchImages();
    _ttsService.init();
  }

  Future<void> fetchImages() async {
    try {
      final response = await http.get(
        Uri.parse(
          '${Constants.baseUrl}/images?category=${widget.imageCategory}',
        ),
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        if (mounted) {
          setState(() {
            images = List<Map<String, dynamic>>.from(data);
            isLoading = false;
          });
        }
      } else {
        throw Exception('Failed to load images: ${response.statusCode}');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          error = e.toString();
          isLoading = false;
        });
      }
    }
  }

  Future<void> speakText(String text, {int? index}) async {
    await _ttsService.speak(text);
  }

  void _showFullScreenImage(BuildContext context, Map<String, dynamic> image) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder:
            (context) => _FullScreenImageView(image: image, onSpeak: speakText),
      ),
    );
  }

  Future<void> _refreshImages() async {
    setState(() {
      isLoading = true;
      error = null;
    });
    await fetchImages();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.title,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: widget.backgroundColor,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _refreshImages,
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              widget.backgroundColor,
              widget.backgroundColor.withOpacity(0.8),
            ],
          ),
        ),
        child: _buildContent(),
      ),
    );
  }

  Widget _buildContent() {
    if (isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: Colors.white),
            SizedBox(height: 16),
            Text(
              'Loading images...',
              style: TextStyle(color: Colors.white, fontSize: 16),
            ),
          ],
        ),
      );
    }

    if (error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, color: Colors.white, size: 64),
            const SizedBox(height: 16),
            Text(
              'Error loading images',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error!,
              style: const TextStyle(color: Colors.white70, fontSize: 14),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _refreshImages,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: widget.backgroundColor,
              ),
              child: const Text('Try Again'),
            ),
          ],
        ),
      );
    }

    if (images.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.image_not_supported, color: Colors.white, size: 64),
            SizedBox(height: 16),
            Text(
              'No images available',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Check back later for new content',
              style: TextStyle(color: Colors.white70, fontSize: 14),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _refreshImages,
      child: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 1,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemCount: images.length,
        itemBuilder: (context, index) {
          final image = images[index];
          return GestureDetector(
            onTap: () => _showFullScreenImage(context, image),
            child: Card(
              elevation: 8,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    CachedNetworkImage(
                      imageUrl: image['imageUrl'],
                      fit: BoxFit.cover,
                      placeholder:
                          (context, url) => Container(
                            color: Colors.grey.shade200,
                            child: const Center(
                              child: CircularProgressIndicator(),
                            ),
                          ),
                      errorWidget:
                          (context, url, error) => Container(
                            color: Colors.grey.shade300,
                            child: const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.broken_image,
                                  size: 32,
                                  color: Colors.grey,
                                ),
                                SizedBox(height: 8),
                                Text(
                                  'Image not available',
                                  style: TextStyle(
                                    color: Colors.grey,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                    ),
                    Positioned(
                      bottom: 0,
                      left: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.bottomCenter,
                            end: Alignment.topCenter,
                            colors: [
                              Colors.black.withOpacity(0.8),
                              Colors.black.withOpacity(0.4),
                              Colors.transparent,
                            ],
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              image['title'] ?? 'Untitled',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (image['description'] != null &&
                                image['description'].toString().isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text(
                                  image['description'],
                                  style: const TextStyle(
                                    color: Colors.white70,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.5),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: IconButton(
                          icon: const Icon(
                            Icons.volume_up,
                            color: Colors.white,
                            size: 20,
                          ),
                          onPressed: () {
                            final textToSpeak =
                                '${image['title'] ?? 'Image'}. ${image['description'] ?? ''}';
                            speakText(textToSpeak);
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _ttsService.stop();
    super.dispose();
  }
}

class _FullScreenImageView extends StatefulWidget {
  final Map<String, dynamic> image;
  final Function(String) onSpeak;

  const _FullScreenImageView({
    Key? key,
    required this.image,
    required this.onSpeak,
  }) : super(key: key);

  @override
  State<_FullScreenImageView> createState() => _FullScreenImageViewState();
}

class _FullScreenImageViewState extends State<_FullScreenImageView>
    with TickerProviderStateMixin {
  late AnimationController _imageAnimController;
  late AnimationController _textAnimController;
  late AnimationController _glowAnimController;

  late Animation<double> _imageScaleAnim;
  late Animation<double> _imageBorderAnim;
  late Animation<Color?> _imageGlowAnim;

  late Animation<double> _titleBounceAnim;
  late Animation<double> _descBounceAnim;
  late Animation<Color?> _titleGlowAnim;
  late Animation<Color?> _descGlowAnim;
  late Animation<double> _titleHighlightAnim;
  late Animation<double> _descHighlightAnim;

  final TTSService _ttsService = TTSService();
  bool isSpeaking = false;
  bool isTitleHighlighted = false;
  bool isDescHighlighted = false;
  bool _isReadingTitle = false;
  bool _isReadingDesc = false;

  @override
  void initState() {
    super.initState();

    // Image animations
    _imageAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    // Text animations
    _textAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    // Glow animations
    _glowAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    // Image animations
    _imageScaleAnim = Tween<double>(begin: 1.0, end: 1.05).animate(
      CurvedAnimation(parent: _imageAnimController, curve: Curves.easeInOut),
    );

    _imageBorderAnim = Tween<double>(begin: 0.0, end: 8.0).animate(
      CurvedAnimation(parent: _imageAnimController, curve: Curves.easeInOut),
    );

    _imageGlowAnim = ColorTween(
      begin: Colors.transparent,
      end: Colors.greenAccent.withOpacity(0.6),
    ).animate(_imageAnimController);

    // Text bounce animations
    _titleBounceAnim = Tween<double>(begin: 1.0, end: 1.03).animate(
      CurvedAnimation(parent: _textAnimController, curve: Curves.elasticInOut),
    );

    _descBounceAnim = Tween<double>(begin: 1.0, end: 1.02).animate(
      CurvedAnimation(parent: _textAnimController, curve: Curves.elasticInOut),
    );

    // Text glow animations
    _titleGlowAnim = ColorTween(
      begin: Colors.transparent,
      end: Colors.yellowAccent.withOpacity(0.8),
    ).animate(_glowAnimController);

    _descGlowAnim = ColorTween(
      begin: Colors.transparent,
      end: Colors.greenAccent.withOpacity(0.7),
    ).animate(_glowAnimController);

    // Text highlight animations
    _titleHighlightAnim = Tween<double>(begin: 0.0, end: 0.3).animate(
      CurvedAnimation(parent: _textAnimController, curve: Curves.easeInOut),
    );

    _descHighlightAnim = Tween<double>(begin: 0.0, end: 0.25).animate(
      CurvedAnimation(parent: _textAnimController, curve: Curves.easeInOut),
    );

    // Auto-start TTS on screen load
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _startTTSWithHighlightSync();
    });
  }

  Future<void> _startTTSWithHighlightSync() async {
    setState(() {
      isSpeaking = true;
      isTitleHighlighted = false;
      isDescHighlighted = false;
    });
    _imageAnimController.repeat(reverse: true);
    _glowAnimController.repeat(reverse: true);

    _ttsService.setStartHandler(() {}); // No highlight here
    _ttsService.setCompletionHandler(() async {
      if (_isReadingTitle && mounted) {
        setState(() => isTitleHighlighted = false);
        _isReadingTitle = false;
        // Start description next if available
        if (widget.image['description'] != null &&
            widget.image['description'].toString().isNotEmpty) {
          _isReadingDesc = true;
          setState(() => isDescHighlighted = true);
          await _ttsService.speak(widget.image['description']);
        } else {
          _finishTTS();
        }
      } else if (_isReadingDesc && mounted) {
        setState(() => isDescHighlighted = false);
        _isReadingDesc = false;
        _finishTTS();
      }
    });

    // Start with title: highlight and speak at the same time
    _isReadingTitle = true;
    setState(() => isTitleHighlighted = true);
    await _ttsService.speak(widget.image['title'] ?? 'Untitled');
  }

  void _finishTTS() {
    if (mounted) {
      setState(() => isSpeaking = false);
      _imageAnimController.reset();
      _textAnimController.reset();
      _glowAnimController.reset();
    }
  }

  @override
  void dispose() {
    _ttsService.setStartHandler(() {}); // Remove handlers
    _ttsService.setCompletionHandler(() {});
    _imageAnimController.dispose();
    _textAnimController.dispose();
    _glowAnimController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE6F2F8),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.black87),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: AnimatedBuilder(
          animation: Listenable.merge([
            _imageAnimController,
            _textAnimController,
            _glowAnimController,
          ]),
          builder: (context, child) {
            return LayoutBuilder(
              builder: (context, constraints) {
                final double contentWidth =
                    constraints.maxWidth - 32; // 16px padding each side
                return Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Top text (title) with animation
                    Padding(
                      padding: const EdgeInsets.only(
                        top: 24.0,
                        left: 16,
                        right: 16,
                        bottom: 8,
                      ),
                      child: Transform.scale(
                        scale:
                            isTitleHighlighted ? _titleBounceAnim.value : 1.0,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color:
                                isTitleHighlighted
                                    ? Colors.yellowAccent.withOpacity(
                                      _titleHighlightAnim.value,
                                    )
                                    : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                            border:
                                isTitleHighlighted
                                    ? Border.all(
                                      color: Colors.yellow.withOpacity(0.6),
                                      width: 2,
                                    )
                                    : null,
                            boxShadow:
                                isTitleHighlighted
                                    ? [
                                      BoxShadow(
                                        color:
                                            _titleGlowAnim.value ??
                                            Colors.transparent,
                                        blurRadius: 20,
                                        spreadRadius: 5,
                                      ),
                                    ]
                                    : null,
                          ),
                          child: Text(
                            widget.image['title'] ?? '',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                              color:
                                  isTitleHighlighted
                                      ? const Color(0xFF2E5339)
                                      : const Color(0xFF223A5E),
                              letterSpacing: 1.2,
                              height: 1.1,
                              shadows:
                                  isTitleHighlighted
                                      ? [
                                        Shadow(
                                          blurRadius: 16,
                                          color: Colors.yellow.withOpacity(0.8),
                                          offset: const Offset(0, 0),
                                        ),
                                      ]
                                      : [
                                        const Shadow(
                                          blurRadius: 6,
                                          color: Colors.black12,
                                          offset: Offset(0, 2),
                                        ),
                                      ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    // Centered image with animated border/glow and width matching bottom text
                    if (widget.image['description'] != null &&
                        widget.image['description'].toString().isNotEmpty)
                      Container(
                        width: contentWidth,
                        margin: const EdgeInsets.only(top: 8, bottom: 8),
                        child: Transform.scale(
                          scale: isSpeaking ? _imageScaleAnim.value : 1.0,
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(32),
                              border: Border.all(
                                color:
                                    isSpeaking
                                        ? _imageGlowAnim.value ??
                                            Colors.greenAccent
                                        : Colors.transparent,
                                width: isSpeaking ? _imageBorderAnim.value : 2,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color:
                                      isSpeaking
                                          ? Colors.greenAccent.withOpacity(0.3)
                                          : Colors.black12,
                                  blurRadius: isSpeaking ? 24 : 16,
                                  spreadRadius: isSpeaking ? 6 : 2,
                                  offset: const Offset(0, 6),
                                ),
                              ],
                            ),
                            clipBehavior: Clip.antiAlias,
                            child: AspectRatio(
                              aspectRatio: 1,
                              child: Image.network(
                                widget.image['imageUrl'],
                                fit: BoxFit.cover,
                                errorBuilder:
                                    (context, error, stackTrace) => const Icon(
                                      Icons.error,
                                      size: 80,
                                      color: Colors.grey,
                                    ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    // Bottom text (description) with animation
                    if (widget.image['description'] != null &&
                        widget.image['description'].toString().isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(
                          bottom: 32.0,
                          left: 16,
                          right: 16,
                          top: 0,
                        ),
                        child: Transform.scale(
                          scale:
                              isDescHighlighted ? _descBounceAnim.value : 1.0,
                          child: Container(
                            width: contentWidth,
                            decoration: BoxDecoration(
                              color:
                                  isDescHighlighted
                                      ? Colors.greenAccent.withOpacity(
                                        _descHighlightAnim.value,
                                      )
                                      : const Color(0xFFFFF3C7),
                              borderRadius: BorderRadius.circular(24),
                              border:
                                  isDescHighlighted
                                      ? Border.all(
                                        color: Colors.green.withOpacity(0.6),
                                        width: 2,
                                      )
                                      : null,
                              boxShadow:
                                  isDescHighlighted
                                      ? [
                                        BoxShadow(
                                          color:
                                              _descGlowAnim.value ??
                                              Colors.transparent,
                                          blurRadius: 18,
                                          spreadRadius: 4,
                                        ),
                                      ]
                                      : [
                                        const BoxShadow(
                                          color: Colors.black12,
                                          blurRadius: 8,
                                          offset: Offset(0, 2),
                                        ),
                                      ],
                            ),
                            padding: const EdgeInsets.symmetric(
                              vertical: 24,
                              horizontal: 12,
                            ),
                            child: Text(
                              widget.image['description'],
                              style: TextStyle(
                                fontSize: 26,
                                color:
                                    isDescHighlighted
                                        ? const Color(0xFF2E5339)
                                        : const Color(0xFF223A5E),
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.1,
                                shadows:
                                    isDescHighlighted
                                        ? [
                                          Shadow(
                                            blurRadius: 12,
                                            color: Colors.green.withOpacity(
                                              0.7,
                                            ),
                                            offset: const Offset(0, 0),
                                          ),
                                        ]
                                        : [],
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                      ),
                    // Play button
                    Padding(
                      padding: const EdgeInsets.only(bottom: 16.0),
                      child: FloatingActionButton.extended(
                        backgroundColor:
                            isSpeaking ? Colors.orange : Colors.blue,
                        onPressed:
                            isSpeaking ? null : _startTTSWithHighlightSync,
                        icon: Icon(
                          isSpeaking ? Icons.volume_up : Icons.play_arrow,
                          color: Colors.white,
                        ),
                        label: Text(
                          isSpeaking ? 'Playing...' : 'Play ',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              },
            );
          },
        ),
      ),
    );
  }
}
