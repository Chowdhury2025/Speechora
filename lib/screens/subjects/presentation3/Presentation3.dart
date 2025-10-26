import 'package:flutter/material.dart';
import 'dart:io';
import '../../../services/tts_service.dart';
import '../../../services/presentation3_service.dart';

class QuizItem {
  final String subject;
  final String imageUrl1;
  final String imageUrl2;
  final String imageName1;
  final String imageName2;
  final String description;
  final String ageGroup;

  QuizItem({
    required this.subject,
    required this.imageUrl1,
    required this.imageUrl2,
    required this.imageName1,
    required this.imageName2,
    required this.description,
    required this.ageGroup,
  });

  factory QuizItem.fromJson(Map<String, dynamic> json) => QuizItem(
    subject: json['subject'],
    imageUrl1: json['imageUrl1'],
    imageUrl2: json['imageUrl2'],
    imageName1: json['imageName1'],
    imageName2: json['imageName2'],
    description: json['description'],
    ageGroup: json['ageGroup'],
  );
}

class Presentation3 extends StatefulWidget {
  final String subject;
  final int initialIndex;
  final List<QuizItem> items;

  const Presentation3({
    Key? key,
    required this.subject,
    this.initialIndex = 0,
    required this.items,
  }) : super(key: key);

  @override
  _Presentation3State createState() => _Presentation3State();
}

class _Presentation3State extends State<Presentation3>
    with SingleTickerProviderStateMixin {
  final TTSService _tts = TTSService();
  final List<QuizItem> _items = [];
  int _currentIndex = 0;
  QuizItem? _selected;
  String? _selectedName;
  bool _hasError = false;
  String? _errorMessage;
  late AnimationController _questionAnimationController;
  late Animation<double> _questionAnimation;
  bool _showFirstImageOnTop = true;
  bool _isLoading = false;
  Presentation3Service? _presentation3Service;

  @override
  void initState() {
    super.initState();
    _questionAnimationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _questionAnimation = Tween<double>(begin: 1.0, end: 1.1).animate(
      CurvedAnimation(
        parent: _questionAnimationController,
        curve: Curves.easeInOut,
      ),
    )..addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _questionAnimationController.reverse();
      }
    });
    _initializePresentation();
  }

  void _initializePresentation() async {
    setState(() {
      _isLoading = true;
    });

    try {
      _presentation3Service = await Presentation3Service.instance;

      setState(() {
        _items.addAll(widget.items);
        _currentIndex = widget.initialIndex;
        if (_items.length < 2) {
          _hasError = true;
          _errorMessage = 'Not enough items to display. Please add more.';
          _isLoading = false;
          return;
        }
      });

      await _downloadAndCacheImages();

      setState(() {
        _isLoading = false;
      });

      WidgetsBinding.instance.addPostFrameCallback((_) => _askQuestion());
    } catch (e) {
      setState(() {
        _hasError = true;
        _errorMessage = 'Failed to initialize: ${e.toString()}';
        _isLoading = false;
      });
    }
  }

  Future<void> _downloadAndCacheImages() async {
    if (_presentation3Service == null || _items.isEmpty) return;

    try {
      final presentation3Items = _items.map((item) => Presentation3Item(
        id: 0,
        subject: item.subject,
        imageUrl1: item.imageUrl1,
        imageUrl2: item.imageUrl2,
        imageName1: item.imageName1,
        imageName2: item.imageName2,
        description: item.description,
        ageGroup: item.ageGroup,
      )).toList();

      await _presentation3Service!.ensureImagesDownloaded(presentation3Items);
      print('All images downloaded and cached successfully');
    } catch (e) {
      print('Error downloading images: $e');
    }
  }

  @override
  void dispose() {
    _questionAnimationController.dispose();
    super.dispose();
  }

  Future<void> _askQuestion() async {
    final item = _items[_currentIndex];
    _showFirstImageOnTop = (DateTime.now().millisecondsSinceEpoch % 2 == 0);
    _questionAnimationController.forward();
    final topName = _showFirstImageOnTop ? item.imageName1 : item.imageName2;
    final bottomName = _showFirstImageOnTop ? item.imageName2 : item.imageName1;
    await _tts.speak("Do you want $topName or $bottomName?");
  }

  Future<void> _onSelect(bool topSelected) async {
    if (_selected != null) return;
    final item = _items[_currentIndex];
    final selectedName = topSelected
        ? (_showFirstImageOnTop ? item.imageName1 : item.imageName2)
        : (_showFirstImageOnTop ? item.imageName2 : item.imageName1);
    setState(() {
      _selected = item;
      _selectedName = selectedName;
    });
    await _tts.speak("I want $selectedName");
    await Future.delayed(const Duration(seconds: 2));
    setState(() {
      _currentIndex = (_currentIndex + 1) % _items.length;
      _selected = null;
      _selectedName = null;
    });
    _askQuestion();
  }

  Future<void> _refreshData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      if (_presentation3Service != null) {
        await _presentation3Service!.clearAllData();
        _presentation3Service = await Presentation3Service.instance;
        await _downloadAndCacheImages();
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Data refreshed and images redownloaded successfully'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to refresh data: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Widget _buildImageWidget(String imageUrl) {
    if (_presentation3Service != null) {
      final localPath = _presentation3Service!.getLocalImagePath(imageUrl);
      if (localPath != null && File(localPath).existsSync()) {
        return Image.file(
          File(localPath),
          width: double.infinity,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => Container(
            color: Colors.grey[300],
            child: Icon(
              Icons.image_not_supported,
              size: 80,
              color: Colors.grey[400],
            ),
          ),
        );
      }
    }
    
    return Image.network(
      imageUrl,
      width: double.infinity,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) => Container(
        color: Colors.grey[300],
        child: Icon(
          Icons.image_not_supported,
          size: 80,
          color: Colors.grey[400],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_hasError) {
      return Scaffold(
        body: Center(
          child: Text(
            _errorMessage ?? 'An error occurred.',
            style: const TextStyle(fontSize: 18, color: Colors.red),
          ),
        ),
      );
    }
    
    if (_isLoading || _items.length < 2) {
      return Scaffold(
        backgroundColor: const Color(0xFFB8E4DA),
        body: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF1E4147)),
              ),
              SizedBox(height: 16),
              Text(
                'Loading and caching images...',
                style: TextStyle(
                  fontSize: 16,
                  color: Color(0xFF1E4147),
                ),
              ),
            ],
          ),
        ),
      );
    }

    final item = _items[_currentIndex];
    final topImageUrl = _showFirstImageOnTop ? item.imageUrl1 : item.imageUrl2;
    final bottomImageUrl = _showFirstImageOnTop ? item.imageUrl2 : item.imageUrl1;
    final topImageName = _showFirstImageOnTop ? item.imageName1 : item.imageName2;
    final bottomImageName = _showFirstImageOnTop ? item.imageName2 : item.imageName1;

    final screenSize = MediaQuery.of(context).size;
    final isSmallScreen = screenSize.height < 700;

    return Scaffold(
      backgroundColor: const Color(0xFFB8E4DA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1E4147)),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF1E4147)),
            onPressed: _refreshData,
            tooltip: 'Refresh and redownload images',
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Top Question Text
            Padding(
              padding: EdgeInsets.symmetric(
                horizontal: 24,
                vertical: isSmallScreen ? 12 : 16,
              ),
              child: ScaleTransition(
                scale: _questionAnimation,
                child: Text(
                  "Do you want $topImageName or $bottomImageName?",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: isSmallScreen ? 28 : 36,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF1E4147),
                    height: 1.2,
                  ),
                ),
              ),
            ),

            // Options as large image cards
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Column(
                  children: [
                    // Top image option
                    Expanded(
                      child: GestureDetector(
                        onTap: () => _onSelect(true),
                        child: Container(
                          width: double.infinity,
                          margin: const EdgeInsets.only(bottom: 12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black12,
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          padding: const EdgeInsets.all(4),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: _buildImageWidget(topImageUrl),
                          ),
                        ),
                      ),
                    ),

                    // Bottom image option
                    Expanded(
                      child: GestureDetector(
                        onTap: () => _onSelect(false),
                        child: Container(
                          width: double.infinity,
                          margin: const EdgeInsets.only(bottom: 12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black12,
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          padding: const EdgeInsets.all(4),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: _buildImageWidget(bottomImageUrl),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Bottom response text
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 400),
              child: _selected != null
                  ? Container(
                      margin: const EdgeInsets.all(16),
                      padding: EdgeInsets.symmetric(
                        vertical: isSmallScreen ? 16 : 20,
                        horizontal: 24,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF6D6),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Text(
                        _selectedName != null ? 'I want $_selectedName' : '',
                        style: TextStyle(
                          fontSize: isSmallScreen ? 24 : 30,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF1E4147),
                        ),
                        textAlign: TextAlign.center,
                      ),
                    )
                  : SizedBox(height: isSmallScreen ? 60 : 80),
            ),
          ],
        ),
      ),
    );
  }
}