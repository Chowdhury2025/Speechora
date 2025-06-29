import 'package:flutter/material.dart';
import '../../../services/tts_service.dart';

class ImageDetailScreen extends StatefulWidget {
  final Map<String, dynamic> image;
  final Function(String) onSpeak;

  const ImageDetailScreen({
    Key? key,
    required this.image,
    required this.onSpeak,
  }) : super(key: key);

  @override
  State<ImageDetailScreen> createState() => _ImageDetailScreenState();
}

class _ImageDetailScreenState extends State<ImageDetailScreen>
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
                final double contentWidth = constraints.maxWidth - 32;
                return Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Title
                          FadeTransition(
                            opacity: _textAnimController,
                            child: ScaleTransition(
                              scale: _titleBounceAnim,
                              child: Container(
                                constraints: BoxConstraints(
                                  maxWidth: contentWidth,
                                ),
                                child: Text(
                                  widget.image['title'] ?? 'Untitled',
                                  style: TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    color: isTitleHighlighted
                                        ? Colors.yellowAccent
                                        : Colors.black87,
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          // Image
                          GestureDetector(
                            onTap: () {
                              // Toggle play/pause on image tap
                              if (isSpeaking) {
                                _ttsService.stop();
                                setState(() {
                                  isSpeaking = false;
                                  isTitleHighlighted = false;
                                  isDescHighlighted = false;
                                });
                              } else {
                                _startTTSWithHighlightSync();
                              }
                            },
                            child: Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black26,
                                    blurRadius: 8,
                                    offset: Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(16),
                                child: Hero(
                                  tag: widget.image['id'],
                                  child: FadeTransition(
                                    opacity: _imageAnimController,
                                    child: ScaleTransition(
                                      scale: _imageScaleAnim,
                                      child: Image.network(
                                        widget.image['url'],
                                        fit: BoxFit.cover,
                                        width: double.infinity,
                                        height: 300,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          // Description
                          FadeTransition(
                            opacity: _textAnimController,
                            child: ScaleTransition(
                              scale: _descBounceAnim,
                              child: Container(
                                constraints: BoxConstraints(
                                  maxWidth: contentWidth,
                                ),
                                child: Text(
                                  widget.image['description'] ?? 'No description',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: isDescHighlighted
                                        ? Colors.greenAccent
                                        : Colors.black54,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Play button
                    if (!isSpeaking)
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: ElevatedButton(
                          onPressed: () {
                            // Start speaking the title and description
                            _startTTSWithHighlightSync();
                          },
                          child: Text('Play Description'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blueAccent,
                            foregroundColor: Colors.white,
                            padding: EdgeInsets.symmetric(
                              vertical: 16,
                              horizontal: 32,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(24),
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
