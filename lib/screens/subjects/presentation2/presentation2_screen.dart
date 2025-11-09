import 'package:flutter/material.dart';
import 'dart:async';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import '../../../models/lesson_models.dart';
import '../../../services/presentation2_service.dart';
import '../../../services/tts_service.dart';

class Presentation2Screen extends StatefulWidget {
  final String title;
  final Color backgroundColor;
  final String subject;

  const Presentation2Screen({
    super.key,
    required this.title,
    required this.backgroundColor,
    required this.subject,
  });

  @override
  State<Presentation2Screen> createState() => _Presentation2ScreenState();
}

class _Presentation2ScreenState extends State<Presentation2Screen>
    with TickerProviderStateMixin {
  late Presentation2Service _service;
  final TTSService _tts = TTSService();
  
  List<Lesson> lessons = [];
  bool isLoading = true;
  String? errorMessage;
  
  // Lesson detail state
  Lesson? currentLesson;
  int? selectedOptionIndex;
  String? selectedItem;
  bool showSuccess = false;
  bool hasStartedReading = false;
  
  // Animation controllers
  late AnimationController _pulseController;
  late AnimationController _successController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _initializeService();
    _setupAnimations();
  }

  void _setupAnimations() {
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    _successController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );
    
    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.1,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));
    
    _pulseController.repeat(reverse: true);
  }

  Future<void> _initializeService() async {
    _service = await Presentation2Service.instance;
    await _loadLessons();
  }

  Future<void> _loadLessons() async {
    if (!mounted) return;
    
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final loadedLessons = await _service.getLessonsBySubject(widget.subject);
      
      if (mounted) {
        setState(() {
          lessons = loadedLessons;
          isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          errorMessage = e.toString();
          isLoading = false;
        });
      }
    }
  }

  Future<void> _refreshLessons() async {
    if (!mounted) return;
    
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final refreshedLessons = await _service.refreshLessons(widget.subject);
      
      if (mounted) {
        setState(() {
          lessons = refreshedLessons;
          isLoading = false;
          // Reset lesson detail state
          currentLesson = null;
          selectedOptionIndex = null;
          selectedItem = null;
          showSuccess = false;
          hasStartedReading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          errorMessage = e.toString();
          isLoading = false;
        });
      }
    }
  }

  void _openLessonDetail(Lesson lesson) {
    setState(() {
      currentLesson = lesson;
      selectedOptionIndex = null;
      selectedItem = null;
      showSuccess = false;
      hasStartedReading = false;
    });
    
    // Start reading the lesson statement
    _startReading();
  }

  void _startReading() {
    if (!hasStartedReading && currentLesson != null) {
      hasStartedReading = true;
      Future.microtask(() {
        final statement = currentLesson!.statement['content'];
        if (statement != null && statement is String) {
          _tts.speak(statement);
        }
      });
    }
  }

  void _selectOption(int index) {
    if (currentLesson == null) return;
    
    setState(() {
      selectedOptionIndex = index;
      selectedItem = currentLesson!.options[index]['content'];
    });
    
    // Speak the selected item
    _tts.speak(selectedItem!);
    
    // Show success animation after a delay
    Timer(Duration(seconds: 1), () {
      if (mounted) {
        setState(() {
          showSuccess = true;
        });
        
        _successController.forward().then((_) {
          Timer(Duration(seconds: 2), () {
            if (mounted) {
              setState(() {
                showSuccess = false;
                selectedOptionIndex = null;
                selectedItem = null;
              });
              _successController.reset();
            }
          });
        });
      }
    });
  }

  void _goBackToLessonList() {
    setState(() {
      currentLesson = null;
      selectedOptionIndex = null;
      selectedItem = null;
      showSuccess = false;
      hasStartedReading = false;
    });
    _tts.stop();
  }

  @override
  void dispose() {
    _tts.stop();
    _pulseController.dispose();
    _successController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(currentLesson?.title ?? widget.title),
        backgroundColor: widget.backgroundColor,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (currentLesson != null) {
              _goBackToLessonList();
            } else {
              Navigator.of(context).pop();
            }
          },
        ),
        actions: [
          if (currentLesson == null)
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: _refreshLessons,
              tooltip: 'Refresh lessons',
            ),
        ],
      ),
      body: currentLesson == null ? _buildLessonList() : _buildLessonDetail(),
    );
  }

  Widget _buildLessonList() {
    if (isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Loading lessons...'),
          ],
        ),
      );
    }

    if (errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red),
            SizedBox(height: 16),
            Text(
              'Error loading lessons',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text(
              errorMessage!,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.red),
            ),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: _refreshLessons,
              child: Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (lessons.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.menu_book, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'No lessons available',
              style: TextStyle(fontSize: 18),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _refreshLessons,
      child: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 1,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemCount: lessons.length,
        itemBuilder: (context, index) {
          final lesson = lessons[index];
          return GestureDetector(
            onTap: () => _openLessonDetail(lesson),
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
                    Container(
                      color: widget.backgroundColor.withOpacity(0.1),
                      child: Icon(
                        Icons.menu_book,
                        size: 48,
                        color: widget.backgroundColor.withOpacity(0.3),
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
                              Colors.transparent,
                            ],
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              lesson.title,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (lesson.description?.isNotEmpty == true)
                              Text(
                                lesson.description!,
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.8),
                                  fontSize: 12,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                          ],
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

  Widget _buildLessonDetail() {
    if (currentLesson == null) return Container();

    final screenWidth = MediaQuery.of(context).size.width;

    return Stack(
      children: [
        SafeArea(
          child: Column(
            children: [
              // Top question section
              Expanded(
                flex: 2,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 20,
                  ),
                  child: Center(
                    child: Text(
                      currentLesson!.statement['content'] ?? 'What do you want?',
                      style: GoogleFonts.nunito(
                        fontSize: screenWidth < 400 ? 32 : 42,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF2E7D7D),
                        height: 1.2,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
              ),

              // Middle grid section (2x3)
              Expanded(
                flex: 5,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: GridView.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 1,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    itemCount: currentLesson!.options.length,
                    itemBuilder: (context, index) {
                      return _buildOptionCard(currentLesson!.options[index], index);
                    },
                  ),
                ),
              ),

              // Bottom response section
              Expanded(
                flex: 2,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  child: Center(
                    child: Text(
                      selectedItem != null
                          ? 'I want $selectedItem'
                          : 'Tap an item above',
                      style: GoogleFonts.nunito(
                        fontSize: screenWidth < 400 ? 24 : 32,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF2E7D7D),
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        if (showSuccess) _buildSuccessOverlay(),
      ],
    );
  }

  Widget _buildOptionCard(Map<String, dynamic> option, int index) {
    final isSelected = selectedOptionIndex == index;
    final screenWidth = MediaQuery.of(context).size.width;
    final cardWidth = (screenWidth - 48) / 2;

    // Define pastel colors for the cards
    final colors = [
      const Color(0xFFFFF8DC), // Cream (Milk)
      const Color(0xFFE6F3FF), // Light Blue (Water)
      const Color(0xFFFFE6E6), // Light Pink (Apple)
      const Color(0xFFE6FFE6), // Light Green (Bread)
      const Color(0xFFFFF0E6), // Light Orange (Orange)
      const Color(0xFFE6E6FF), // Light Purple (Tea)
    ];

    final cardColor = colors[index % colors.length];

    return GestureDetector(
      onTap: () => _selectOption(index),
      child: AnimatedBuilder(
        animation: isSelected ? _pulseAnimation : 
                   const AlwaysStoppedAnimation(1.0),
        builder: (context, child) {
          return Transform.scale(
            scale: isSelected ? _pulseAnimation.value : 1.0,
            child: Container(
              width: cardWidth,
              height: cardWidth,
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected 
                      ? const Color(0xFF2E7D7D)
                      : Colors.grey.withOpacity(0.3),
                  width: isSelected ? 4 : 2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Expanded(
                    flex: 3,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      child: Icon(
                        _getIconForOption(option['content']),
                        size: 48,
                        color: const Color(0xFF2E7D7D),
                      ),
                    ),
                  ),
                  Expanded(
                    flex: 2,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Text(
                        option['content'] ?? '',
                        style: GoogleFonts.nunito(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF2E7D7D),
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  IconData _getIconForOption(String content) {
    final contentLower = content.toLowerCase();
    
    if (contentLower.contains('milk') || contentLower.contains('drink')) {
      return Icons.local_drink;
    } else if (contentLower.contains('water')) {
      return Icons.water_drop;
    } else if (contentLower.contains('apple') || contentLower.contains('fruit')) {
      return Icons.apple;
    } else if (contentLower.contains('bread') || contentLower.contains('food')) {
      return Icons.bakery_dining;
    } else if (contentLower.contains('orange')) {
      return Icons.circle;
    } else if (contentLower.contains('tea') || contentLower.contains('coffee')) {
      return Icons.coffee;
    } else {
      return Icons.category;
    }
  }

  Widget _buildSuccessOverlay() {
    return Container(
      color: Colors.black.withOpacity(0.7),
      child: Center(
        child: SizedBox(
          width: 300,
          height: 300,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Lottie.asset(
                    'assets/animations/completed_a_task.json',
                    controller: _successController,
                    onLoaded: (composition) {
                      _successController.duration = composition.duration;
                      _successController.forward();
                    },
                    fit: BoxFit.contain,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  'Great choice!',
                  style: GoogleFonts.nunito(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}