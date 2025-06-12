import 'package:flutter/material.dart';
import '../models/image_model.dart';
import '../services/image_service.dart';

class ImageListScreen extends StatefulWidget {
  const ImageListScreen({super.key});

  @override
  State<ImageListScreen> createState() => _ImageListScreenState();
}

class _ImageListScreenState extends State<ImageListScreen> {
  final ImageService _imageService = ImageService();
  bool _isLoading = true;
  List<ImageModel> _images = [];
  String? _errorMessage;
  String? _selectedAgeGroup;

  @override
  void initState() {
    super.initState();
    _loadImages();
  }

  Future<void> _loadImages() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      final images = await _imageService.getImages(ageGroup: _selectedAgeGroup);

      setState(() {
        _images = images;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _refreshImages() async {
    await _loadImages();
  }

  Widget _buildImageCard(ImageModel image) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          Navigator.pushNamed(context, '/image-detail', arguments: image.id);
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            image.thumbnail != null || image.imageUrl.isNotEmpty
                ? Image.network(
                  image.thumbnail ?? image.imageUrl,
                  height: 150,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      height: 150,
                      color: Colors.grey[300],
                      child: const Icon(Icons.error),
                    );
                  },
                )
                : Container(
                  height: 150,
                  color: Colors.grey[300],
                  child: const Icon(Icons.image),
                ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    image.title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (image.description != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      image.description!,
                      style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  if (image.category != null || image.ageGroup != null) ...[
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: [
                        if (image.category != null)
                          Chip(
                            label: Text(image.category!),
                            materialTapTargetSize:
                                MaterialTapTargetSize.shrinkWrap,
                          ),
                        if (image.ageGroup != null)
                          Chip(
                            label: Text(image.ageGroup!),
                            materialTapTargetSize:
                                MaterialTapTargetSize.shrinkWrap,
                          ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Images'),
        actions: [
          PopupMenuButton<String?>(
            onSelected: (value) {
              setState(() {
                _selectedAgeGroup = value;
              });
              _loadImages();
            },
            itemBuilder:
                (context) => [
                  const PopupMenuItem(value: null, child: Text('All Ages')),
                  const PopupMenuItem(value: '3-5', child: Text('3-5 years')),
                  const PopupMenuItem(value: '6-8', child: Text('6-8 years')),
                  const PopupMenuItem(value: '9-11', child: Text('9-11 years')),
                  const PopupMenuItem(
                    value: '12-14',
                    child: Text('12-14 years'),
                  ),
                ],
            icon: const Icon(Icons.filter_list),
          ),
        ],
      ),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _errorMessage != null
              ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      _errorMessage!,
                      style: const TextStyle(color: Colors.red),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _refreshImages,
                      child: const Text('Try Again'),
                    ),
                  ],
                ),
              )
              : RefreshIndicator(
                onRefresh: _refreshImages,
                child:
                    _images.isEmpty
                        ? const Center(child: Text('No images found'))
                        : GridView.builder(
                          padding: const EdgeInsets.all(8),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                childAspectRatio: 0.75,
                                crossAxisSpacing: 8,
                                mainAxisSpacing: 8,
                              ),
                          itemCount: _images.length,
                          itemBuilder: (context, index) {
                            return _buildImageCard(_images[index]);
                          },
                        ),
              ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, '/image-upload');
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
